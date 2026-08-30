import { useState, useEffect } from 'react';
import { GameConfig, GameItem, LootBox, PityTracker, GameEvent } from '../types/game';
import { INITIAL_CONFIG, INITIAL_PITY, simulateOnChainOpen, getRandomInt } from '../utils/suiClient';
import { useSoundEffects } from './useSoundEffects';

const STORAGE_KEY = 'sui_gaming_lootbox_state_v1';

export function useSuiGame() {
  const { playSound } = useSoundEffects();

  // User state
  const [userAddress] = useState<string>('0x7e8b91a34f89d0c2e3a1...9b2f');
  const [userBalanceSui, setUserBalanceSui] = useState<number>(50.0);
  const [ownedBoxes, setOwnedBoxes] = useState<LootBox[]>([]);
  const [inventory, setInventory] = useState<GameItem[]>([]);
  const [pityTracker, setPityTracker] = useState<PityTracker>(INITIAL_PITY);
  const [gameConfig, setGameConfig] = useState<GameConfig>(INITIAL_CONFIG);
  const [events, setEvents] = useState<GameEvent[]>([]);

  // UI action states
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [recentlyMintedItem, setRecentlyMintedItem] = useState<{ item: GameItem; pityTriggered: boolean } | null>(null);
  const [isTxPending, setIsTxPending] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.gameConfig) setGameConfig(parsed.gameConfig);
        if (parsed.pityTracker) setPityTracker(parsed.pityTracker);
        if (parsed.inventory) setInventory(parsed.inventory);
        if (parsed.ownedBoxes) setOwnedBoxes(parsed.ownedBoxes);
        if (parsed.userBalanceSui !== undefined) setUserBalanceSui(parsed.userBalanceSui);
        if (parsed.events) {
          setEvents(parsed.events.map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) })));
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save to local storage
  const saveState = (
    config: GameConfig,
    pity: PityTracker,
    inv: GameItem[],
    boxes: LootBox[],
    bal: number,
    evts: GameEvent[]
  ) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        gameConfig: config,
        pityTracker: pity,
        inventory: inv,
        ownedBoxes: boxes,
        userBalanceSui: bal,
        events: evts,
      }));
    } catch {
      // Ignore
    }
  };

  // 1. Purchase Loot Box
  const purchaseLootBox = (count: number = 1) => {
    if (gameConfig.isPaused) {
      showToast('Cannot purchase: Game is currently paused by admin.', 'error');
      return;
    }

    const priceSuiPerBox = gameConfig.boxPriceMist / 1_000_000_000;
    const totalCost = priceSuiPerBox * count;

    if (userBalanceSui < totalCost) {
      showToast(`Insufficient balance! Need ${totalCost.toFixed(2)} SUI`, 'error');
      return;
    }

    setIsTxPending(true);
    playSound('buy');

    setTimeout(() => {
      const newBoxes: LootBox[] = [];
      const newEvents: GameEvent[] = [...events];
      let currentPurchased = gameConfig.totalBoxesPurchased;

      for (let i = 0; i < count; i++) {
        currentPurchased += 1;
        const boxId = `0x${Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b => b.toString(16).padStart(2, '0')).join('')}`;
        const newBox: LootBox = {
          id: boxId,
          serialNumber: currentPurchased,
          purchasedAtEpoch: Math.floor(Date.now() / 1000),
          purchasedBy: userAddress,
        };
        newBoxes.push(newBox);

        newEvents.unshift({
          id: `evt-${Date.now()}-${i}`,
          type: 'LootBoxPurchased',
          timestamp: new Date(),
          data: {
            lootboxId: boxId,
            purchaser: userAddress,
            price: gameConfig.boxPriceMist,
            serialNumber: currentPurchased,
          }
        });
      }

      const updatedBoxes = [...ownedBoxes, ...newBoxes];
      const updatedBalance = userBalanceSui - totalCost;
      const updatedConfig: GameConfig = {
        ...gameConfig,
        totalBoxesPurchased: currentPurchased,
        treasuryBalanceMist: gameConfig.treasuryBalanceMist + (gameConfig.boxPriceMist * count),
      };

      setOwnedBoxes(updatedBoxes);
      setUserBalanceSui(updatedBalance);
      setGameConfig(updatedConfig);
      setEvents(newEvents);
      setIsTxPending(false);

      saveState(updatedConfig, pityTracker, inventory, updatedBoxes, updatedBalance, newEvents);
      showToast(`Successfully purchased ${count} Loot Box${count > 1 ? 'es' : ''}!`, 'success');
    }, 600);
  };

  // 2. Open Loot Box with Animation & On-Chain Randomness
  const openLootBox = async (boxToOpen?: LootBox) => {
    if (gameConfig.isPaused) {
      showToast('Game is paused!', 'error');
      return;
    }

    const box = boxToOpen || ownedBoxes[0];
    if (!box) {
      showToast('No loot boxes available to open! Purchase one first.', 'error');
      return;
    }

    setIsOpening(true);
    playSound('shake');

    // Suspense shake & particle build up
    setTimeout(() => {
      playSound('shake');
    }, 500);

    setTimeout(() => {
      // Execute the verifiable on-chain simulation
      const { item, newPity, newConfig, pityTriggered, event } = simulateOnChainOpen(
        gameConfig,
        pityTracker,
        userAddress,
        box
      );

      // Play sound according to rarity
      if (item.rarity === 0) playSound('open_common');
      else if (item.rarity === 1) playSound('open_rare');
      else if (item.rarity === 2) playSound('open_epic');
      else playSound('open_legendary');

      const updatedBoxes = ownedBoxes.filter(b => b.id !== box.id);
      const updatedInventory = [item, ...inventory];
      const updatedEvents = [event, ...events];

      setOwnedBoxes(updatedBoxes);
      setInventory(updatedInventory);
      setPityTracker(newPity);
      setGameConfig(newConfig);
      setEvents(updatedEvents);
      setRecentlyMintedItem({ item, pityTriggered });
      setIsOpening(false);

      saveState(newConfig, newPity, updatedInventory, updatedBoxes, userBalanceSui, updatedEvents);

      if (pityTriggered) {
        showToast('🌟 PITY SYSTEM TRIGGERED: Guaranteed Legendary Unlocked!', 'success');
      } else if (item.rarity === 3) {
        showToast('🔥 SUPREME DROP: You minted a LEGENDARY NFT!', 'success');
      } else {
        showToast(`Opened: ${item.name} (${item.rarity === 0 ? 'Common' : item.rarity === 1 ? 'Rare' : 'Epic'})`, 'info');
      }
    }, 1800);
  };

  // 3. Transfer GameItem NFT
  const transferItem = (itemId: string, recipientAddress: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    setIsTxPending(true);
    setTimeout(() => {
      const updatedInv = inventory.filter(i => i.id !== itemId);
      const newEvent: GameEvent = {
        id: `evt-${Date.now()}`,
        type: 'ItemTransferred',
        timestamp: new Date(),
        data: {
          itemId: item.id,
          from: userAddress,
          to: recipientAddress,
          serialNumber: item.serialNumber,
        }
      };
      const updatedEvents = [newEvent, ...events];

      setInventory(updatedInv);
      setEvents(updatedEvents);
      setIsTxPending(false);

      saveState(gameConfig, pityTracker, updatedInv, ownedBoxes, userBalanceSui, updatedEvents);
      showToast(`Item #${item.serialNumber} transferred to ${recipientAddress.slice(0, 8)}...`, 'success');
    }, 500);
  };

  // 4. Burn GameItem NFT
  const burnItem = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    playSound('burn');
    setIsTxPending(true);

    setTimeout(() => {
      const updatedInv = inventory.filter(i => i.id !== itemId);
      const newEvent: GameEvent = {
        id: `evt-${Date.now()}`,
        type: 'ItemBurned',
        timestamp: new Date(),
        data: {
          itemId: item.id,
          burner: userAddress,
          rarity: item.rarity,
          power: item.power,
          serialNumber: item.serialNumber,
        }
      };
      const updatedEvents = [newEvent, ...events];

      setInventory(updatedInv);
      setEvents(updatedEvents);
      setIsTxPending(false);

      saveState(gameConfig, pityTracker, updatedInv, ownedBoxes, userBalanceSui, updatedEvents);
      showToast(`Item #${item.serialNumber} burned and destroyed!`, 'info');
    }, 500);
  };

  // 5. Admin: Update Rarity Weights
  const updateWeights = (common: number, rare: number, epic: number, legendary: number) => {
    if (common + rare + epic + legendary !== 100) {
      showToast('Weights must sum up to exactly 100!', 'error');
      return;
    }

    const updatedConfig: GameConfig = {
      ...gameConfig,
      commonWeight: common,
      rareWeight: rare,
      epicWeight: epic,
      legendaryWeight: legendary,
    };

    const newEvent: GameEvent = {
      id: `evt-${Date.now()}`,
      type: 'RarityWeightsUpdated',
      timestamp: new Date(),
      data: {
        commonWeight: common,
        rareWeight: rare,
        epicWeight: epic,
        legendaryWeight: legendary,
      }
    };
    const updatedEvents = [newEvent, ...events];

    setGameConfig(updatedConfig);
    setEvents(updatedEvents);
    saveState(updatedConfig, pityTracker, inventory, ownedBoxes, userBalanceSui, updatedEvents);
    showToast('Rarity weights successfully updated!', 'success');
  };

  // 6. Admin: Update Price
  const updatePrice = (newPriceSui: number) => {
    if (newPriceSui <= 0) {
      showToast('Price must be greater than 0', 'error');
      return;
    }
    const newPriceMist = Math.round(newPriceSui * 1_000_000_000);
    const updatedConfig: GameConfig = {
      ...gameConfig,
      boxPriceMist: newPriceMist,
    };
    const newEvent: GameEvent = {
      id: `evt-${Date.now()}`,
      type: 'PriceUpdated',
      timestamp: new Date(),
      data: {
        oldPrice: gameConfig.boxPriceMist,
        newPrice: newPriceMist,
      }
    };
    const updatedEvents = [newEvent, ...events];

    setGameConfig(updatedConfig);
    setEvents(updatedEvents);
    saveState(updatedConfig, pityTracker, inventory, ownedBoxes, userBalanceSui, updatedEvents);
    showToast(`Loot Box price updated to ${newPriceSui} SUI`, 'success');
  };

  // 7. Admin: Withdraw Treasury
  const withdrawTreasury = () => {
    if (gameConfig.treasuryBalanceMist <= 0) {
      showToast('Treasury is empty!', 'error');
      return;
    }

    const withdrawnSui = gameConfig.treasuryBalanceMist / 1_000_000_000;
    const updatedBalance = userBalanceSui + withdrawnSui;
    const updatedConfig: GameConfig = {
      ...gameConfig,
      treasuryBalanceMist: 0,
    };

    const newEvent: GameEvent = {
      id: `evt-${Date.now()}`,
      type: 'TreasuryWithdrawn',
      timestamp: new Date(),
      data: {
        recipient: userAddress,
        amount: gameConfig.treasuryBalanceMist,
      }
    };
    const updatedEvents = [newEvent, ...events];

    setUserBalanceSui(updatedBalance);
    setGameConfig(updatedConfig);
    setEvents(updatedEvents);
    saveState(updatedConfig, pityTracker, inventory, ownedBoxes, updatedBalance, updatedEvents);
    showToast(`Withdrew ${withdrawnSui.toFixed(3)} SUI to admin wallet!`, 'success');
  };

  // 8. Admin: Toggle Pause
  const togglePause = () => {
    const newPause = !gameConfig.isPaused;
    const updatedConfig: GameConfig = {
      ...gameConfig,
      isPaused: newPause,
    };
    const newEvent: GameEvent = {
      id: `evt-${Date.now()}`,
      type: 'GamePauseStateChanged',
      timestamp: new Date(),
      data: { isPaused: newPause }
    };
    const updatedEvents = [newEvent, ...events];

    setGameConfig(updatedConfig);
    setEvents(updatedEvents);
    saveState(updatedConfig, pityTracker, inventory, ownedBoxes, userBalanceSui, updatedEvents);
    showToast(newPause ? 'Game is now paused' : 'Game unpaused and active', 'info');
  };

  // Faucet helper for demo
  const claimTestnetFaucet = () => {
    const newBal = userBalanceSui + 10.0;
    setUserBalanceSui(newBal);
    saveState(gameConfig, pityTracker, inventory, ownedBoxes, newBal, events);
    showToast('+10.0 SUI claimed from Testnet Faucet!', 'success');
  };

  // Reset demo
  const resetDemoState = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGameConfig(INITIAL_CONFIG);
    setPityTracker(INITIAL_PITY);
    setInventory([]);
    setOwnedBoxes([]);
    setUserBalanceSui(50.0);
    setEvents([]);
    showToast('Demo data reset to factory default state', 'info');
  };

  return {
    userAddress,
    userBalanceSui,
    ownedBoxes,
    inventory,
    pityTracker,
    gameConfig,
    events,
    isOpening,
    recentlyMintedItem,
    isTxPending,
    toastMessage,
    setRecentlyMintedItem,
    purchaseLootBox,
    openLootBox,
    transferItem,
    burnItem,
    updateWeights,
    updatePrice,
    withdrawTreasury,
    togglePause,
    claimTestnetFaucet,
    resetDemoState,
  };
}
