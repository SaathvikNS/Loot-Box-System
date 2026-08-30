import React from 'react';
import { GameConfig, RARITY_INFO, RarityTier } from '../types/game';
import { Percent, ShieldCheck, Dice5, Zap, Lock } from 'lucide-react';

interface RarityDistributionProps {
  config: GameConfig;
}

export const RarityDistribution: React.FC<RarityDistributionProps> = ({ config }) => {
  const tiers: { tier: RarityTier; weight: number; range: string }[] = [
    { tier: 0, weight: config.commonWeight, range: `0 - ${config.commonWeight - 1}` },
    {
      tier: 1,
      weight: config.rareWeight,
      range: `${config.commonWeight} - ${config.commonWeight + config.rareWeight - 1}`,
    },
    {
      tier: 2,
      weight: config.epicWeight,
      range: `${config.commonWeight + config.rareWeight} - ${config.commonWeight + config.rareWeight + config.epicWeight - 1}`,
    },
    {
      tier: 3,
      weight: config.legendaryWeight,
      range: `${config.commonWeight + config.rareWeight + config.epicWeight} - 99`,
    },
  ];

  return (
    <div className="space-y-8">

      {/* Overview Card */}
      <div className="rounded-3xl glass-panel-glow p-6 sm:p-8 border border-cyan-500/30">
        <div className="flex items-center space-x-3 mb-3">
          <Dice5 className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-extrabold text-white font-['Cinzel',serif]">
            Drop Rate Distribution & Randomness Architecture
          </h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          Reward tiers are calculated on-chain using Sui&apos;s native distributed randomness beacon (<code className="text-cyan-300 font-mono">sui::random</code>). When opening a mystery crate, a cryptographically secure pseudo-random number between <code className="text-cyan-300 font-mono">0</code> and <code className="text-cyan-300 font-mono">99</code> is generated to match against cumulative weight ranges.
        </p>
      </div>

      {/* Rarity Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map(({ tier, weight, range }) => {
          const info = RARITY_INFO[tier];
          return (
            <div
              key={tier}
              className="rounded-2xl glass-panel p-5 border flex flex-col justify-between shadow-xl relative overflow-hidden"
              style={{ borderColor: info.color + '50' }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none" style={{ backgroundColor: info.color + '25' }} />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${info.badgeBg}`}>
                    {info.name}
                  </span>
                  <span className="text-lg font-extrabold font-mono" style={{ color: info.color }}>
                    {weight}%
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">
                  {info.name} Tier Armaments
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  {info.description}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>RNG Roll Range:</span>
                  <span className="text-cyan-300 font-bold">[{range}]</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Power Range:</span>
                  <span className="text-yellow-400 font-bold">{info.powerRange} pts</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Weight Value:</span>
                  <span className="text-slate-200 font-bold">{weight} / 100</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Cryptographic Security Details */}
      <div className="rounded-2xl glass-panel p-6 border border-sui-border space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Security Architecture: Why <code className="text-cyan-300 text-sm font-mono">entry</code> function protection is mandatory on Sui
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="bg-sui-dark/80 p-4 rounded-xl border border-slate-800">
            <h4 className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              1. Non-Composable Entry Restriction
            </h4>
            <p>
              The <code className="text-cyan-300 font-mono">open_loot_box</code> function is declared strictly as <code className="text-cyan-300 font-mono">entry fun</code> (not <code className="text-cyan-300 font-mono">public entry</code> or <code className="text-cyan-300 font-mono">public</code>). This prevents third-party contracts from wrapping the function call in a Programmable Transaction Block (PTB) to inspect the minted outcome and abort if the rarity isn&apos;t Legendary.
            </p>
          </div>

          <div className="bg-sui-dark/80 p-4 rounded-xl border border-slate-800">
            <h4 className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              2. Generator Created In-Place
            </h4>
            <p>
              The RandomGenerator is always initialized internally via <code className="text-cyan-300 font-mono">random::new_generator(r, ctx)</code> and consumed in the same scope. Never accepting a RandomGenerator parameter ensures deterministic isolation against state manipulation.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
