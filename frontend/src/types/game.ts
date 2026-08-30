export type RarityTier = 0 | 1 | 2 | 3;

export interface GameItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: RarityTier;
  power: number;
  serialNumber: number;
  mintedAtEpoch: number;
  originalOwner: string;
}

export interface LootBox {
  id: string;
  serialNumber: number;
  purchasedAtEpoch: number;
  purchasedBy: string;
}

export interface PityTracker {
  counter: number;
  totalOpened: number;
  legendaryCount: number;
}

export interface GameConfig {
  commonWeight: number;
  rareWeight: number;
  epicWeight: number;
  legendaryWeight: number;
  boxPriceMist: number;
  pityThreshold: number;
  treasuryBalanceMist: number;
  totalBoxesPurchased: number;
  totalBoxesOpened: number;
  totalItemsMinted: number;
  isPaused: boolean;
}

export interface GameEvent {
  id: string;
  type: 'LootBoxPurchased' | 'LootBoxOpened' | 'ItemTransferred' | 'ItemBurned' | 'RarityWeightsUpdated' | 'PriceUpdated' | 'TreasuryWithdrawn' | 'GamePauseStateChanged';
  timestamp: Date;
  data: Record<string, any>;
}

export const RARITY_INFO: Record<RarityTier, {
  name: string;
  color: string;
  badgeBg: string;
  border: string;
  glow: string;
  dropRate: string;
  powerRange: string;
  description: string;
}> = {
  0: {
    name: 'Common',
    color: '#94A3B8',
    badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-600',
    border: 'border-slate-600',
    glow: 'rgba(148, 163, 184, 0.4)',
    dropRate: '60%',
    powerRange: '1 - 10',
    description: 'Standard battle armaments with fundamental utility.',
  },
  1: {
    name: 'Rare',
    color: '#38BDF8',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500',
    border: 'border-sky-500',
    glow: 'rgba(56, 189, 248, 0.5)',
    dropRate: '25%',
    powerRange: '11 - 25',
    description: 'Enchanted relics forged in elemental arcane essence.',
  },
  2: {
    name: 'Epic',
    color: '#A855F7',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500',
    border: 'border-purple-500',
    glow: 'rgba(168, 85, 247, 0.6)',
    dropRate: '12%',
    powerRange: '26 - 40',
    description: 'Ancient heirlooms pulsing with destructive cosmic power.',
  },
  3: {
    name: 'Legendary',
    color: '#F59E0B',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500',
    border: 'border-amber-500',
    glow: 'rgba(245, 158, 11, 0.8)',
    dropRate: '3%',
    powerRange: '41 - 50',
    description: 'God-tier celestial artifacts with supreme dominance.',
  },
};
