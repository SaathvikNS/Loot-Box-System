import { GameConfig, GameItem, LootBox, PityTracker, GameEvent, RarityTier } from '../types/game';

// Initial default state mirroring on-chain contract defaults
export const INITIAL_CONFIG: GameConfig = {
  commonWeight: 60,
  rareWeight: 25,
  epicWeight: 12,
  legendaryWeight: 3,
  boxPriceMist: 100_000_000, // 0.1 SUI
  pityThreshold: 30,
  treasuryBalanceMist: 0,
  totalBoxesPurchased: 0,
  totalBoxesOpened: 0,
  totalItemsMinted: 0,
  isPaused: false,
};

export const INITIAL_PITY: PityTracker = {
  counter: 0,
  totalOpened: 0,
  legendaryCount: 0,
};

const ITEM_NAMES = {
  0: ['Rusty Iron Blade', 'Novice Wooden Wand', 'Reinforced Buckler', 'Apprentice Dagger', 'Worn Leather Tunic'],
  1: ['Frostforged Longsword', 'Arcane Spellblade', 'Shadowstride Cloak', 'Stormcaller Bow', 'Runed Aegis'],
  2: ['Dragonflame Glaive', 'Celestial Aegis Shield', 'Voidwalker Staff', 'Phoenix Feather Robe', 'Astral Cleaver'],
  3: ['Aethelgard World-Breaker', 'Crown of Immortal Dominion', 'Omniscience Soulreaver', 'Excalibur of the Cosmos', 'Infinity Heart Prism'],
};

const ITEM_DESCRIPTIONS = {
  0: 'A humble beginner equipment with reliable utility on the battlefield.',
  1: 'An enchanted weapon radiating arcane energy and battle-tested fortitude.',
  2: 'An ancient heirloom pulsing with catastrophic destructive power.',
  3: 'A mythical artifact imbued with celestial divinity and supreme dominance.',
};

const ITEM_IMAGES = {
  0: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=600&auto=format&fit=crop&q=80',
  1: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
  2: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  3: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=80',
};

// Generates cryptographically secure random uint within [min, max]
export function getRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return min + (array[0] % range);
}

// Simulates the exact on-chain open_loot_box execution flow
export function simulateOnChainOpen(
  config: GameConfig,
  pity: PityTracker,
  userAddress: string,
  lootbox: LootBox
): {
  item: GameItem;
  newPity: PityTracker;
  newConfig: GameConfig;
  pityTriggered: boolean;
  event: GameEvent;
} {
  const pityTriggered = pity.counter >= config.pityThreshold;

  let rarity: RarityTier;
  let power: number;

  if (pityTriggered) {
    // Guaranteed Legendary via Pity System
    rarity = 3;
    power = getRandomInt(41, 50);
  } else {
    // Secure roll 0-99
    const roll = getRandomInt(0, 99);
    const commonThreshold = config.commonWeight;
    const rareThreshold = commonThreshold + config.rareWeight;
    const epicThreshold = rareThreshold + config.epicWeight;

    if (roll < commonThreshold) {
      rarity = 0;
      power = getRandomInt(1, 10);
    } else if (roll < rareThreshold) {
      rarity = 1;
      power = getRandomInt(11, 25);
    } else if (roll < epicThreshold) {
      rarity = 2;
      power = getRandomInt(26, 40);
    } else {
      rarity = 3;
      power = getRandomInt(41, 50);
    }
  }

  const isLegendary = rarity === 3;
  const newCounter = isLegendary ? 0 : pity.counter + 1;
  const newLegendaryCount = isLegendary ? pity.legendaryCount + 1 : pity.legendaryCount;

  const newPity: PityTracker = {
    counter: newCounter,
    totalOpened: pity.totalOpened + 1,
    legendaryCount: newLegendaryCount,
  };

  const newMintIndex = config.totalItemsMinted + 1;
  const nameVariants = ITEM_NAMES[rarity];
  const name = nameVariants[getRandomInt(0, nameVariants.length - 1)];
  const description = ITEM_DESCRIPTIONS[rarity];
  const imageUrl = ITEM_IMAGES[rarity];

  const item: GameItem = {
    id: `0x${Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b => b.toString(16).padStart(2, '0')).join('')}`,
    name,
    description,
    imageUrl,
    rarity,
    power,
    serialNumber: newMintIndex,
    mintedAtEpoch: Math.floor(Date.now() / 1000),
    originalOwner: userAddress,
  };

  const newConfig: GameConfig = {
    ...config,
    totalBoxesOpened: config.totalBoxesOpened + 1,
    totalItemsMinted: newMintIndex,
  };

  const event: GameEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'LootBoxOpened',
    timestamp: new Date(),
    data: {
      itemId: item.id,
      recipient: userAddress,
      rarity,
      power,
      serialNumber: item.serialNumber,
      lootboxSerial: lootbox.serialNumber,
      pityTriggered,
      pityCounterAfter: newCounter,
    },
  };

  return { item, newPity, newConfig, pityTriggered, event };
}
