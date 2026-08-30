import React from 'react';
import { GameConfig } from '../types/game';
import { ShieldCheck, Dna, Flame, Sparkles, TrendingUp } from 'lucide-react';

interface HeroBannerProps {
  config: GameConfig;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ config }) => {
  const treasurySui = (config.treasuryBalanceMist / 1_000_000_000).toFixed(2);
  const boxPriceSui = (config.boxPriceMist / 1_000_000_000).toFixed(2);

  return (
    <div className="relative overflow-hidden rounded-2xl glass-panel-glow p-6 sm:p-8 mb-8 border border-cyan-500/20">
      {/* Background ambient lighting */}
      <div className="absolute -right-16 -top-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

        {/* Left Headline */}
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sui Native Randomness (sui::random)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Dna className="w-3.5 h-3.5" />
              Dynamic Fields Pity Tracker
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Flame className="w-3.5 h-3.5" />
              Private Entry Protected
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 font-['Cinzel',serif]">
            Verifiable Web3 Mystery Loot Box Armory
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Acquire unopened mystery crates, trigger cryptographically secure validator beacon randomness, and mint high-utility game item NFTs with full on-chain metadata and guaranteed pity mechanics.
          </p>
        </div>

        {/* Right Stats Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">

          <div className="bg-sui-dark/80 border border-slate-700/60 rounded-xl p-3 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Box Price
            </span>
            <span className="text-lg font-extrabold font-mono text-cyan-300">
              {boxPriceSui} SUI
            </span>
          </div>

          <div className="bg-sui-dark/80 border border-slate-700/60 rounded-xl p-3 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Boxes Purchased
            </span>
            <span className="text-lg font-extrabold font-mono text-white">
              {config.totalBoxesPurchased}
            </span>
          </div>

          <div className="bg-sui-dark/80 border border-slate-700/60 rounded-xl p-3 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Items Minted
            </span>
            <span className="text-lg font-extrabold font-mono text-purple-400">
              {config.totalItemsMinted}
            </span>
          </div>

          <div className="bg-sui-dark/80 border border-slate-700/60 rounded-xl p-3 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Treasury Balance
            </span>
            <span className="text-lg font-extrabold font-mono text-amber-400">
              {treasurySui} SUI
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
