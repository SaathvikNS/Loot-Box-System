import React from 'react';
import { PityTracker, GameConfig } from '../types/game';
import { Sparkles, Trophy, Flame, HelpCircle, CheckCircle2 } from 'lucide-react';

interface PityTrackerWidgetProps {
  pity: PityTracker;
  config: GameConfig;
}

export const PityTrackerWidget: React.FC<PityTrackerWidgetProps> = ({ pity, config }) => {
  const threshold = config.pityThreshold || 30;
  const progressPercent = Math.min(100, Math.round((pity.counter / threshold) * 100));
  const isPrimed = pity.counter >= threshold;
  const remaining = Math.max(0, threshold - pity.counter);

  return (
    <div className="rounded-2xl glass-panel p-6 border border-sui-border/70 relative overflow-hidden">
      {/* Decorative Aura */}
      {isPrimed && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-amber-500/10 animate-pulse pointer-events-none" />
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className={`w-5 h-5 ${isPrimed ? 'text-amber-400 animate-spin' : 'text-amber-400'}`} />
              Dynamic Field Pity Engine
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Threshold: {threshold} Opens
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracks consecutive non-legendary opens per user via Sui Dynamic Fields. Guarantees a Legendary NFT on reach!
          </p>
        </div>

        {/* Status Pill */}
        {isPrimed ? (
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 px-4 py-2 rounded-xl font-extrabold text-sm shadow-lg shadow-amber-500/30 animate-bounce">
            <Flame className="w-4 h-4 fill-current" />
            <span>GUARANTEED LEGENDARY NEXT OPEN!</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{remaining} more non-legendary opens until guarantee</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-slate-300 font-semibold">
            Progress: <span className="text-cyan-400 text-sm font-bold">{pity.counter}</span> / {threshold}
          </span>
          <span className="text-amber-400 font-bold">{progressPercent}%</span>
        </div>

        <div className="w-full h-3.5 bg-slate-900/90 rounded-full overflow-hidden border border-slate-700/80 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isPrimed
                ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-lg shadow-amber-500/50 animate-pulse'
                : 'bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400'
              }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Footnote */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
        <div className="flex items-center space-x-2 text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>Total Opened: <strong className="text-slate-200">{pity.totalOpened}</strong></span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Legendaries Hit: <strong className="text-amber-300">{pity.legendaryCount}</strong></span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400 col-span-2 sm:col-span-1">
          <HelpCircle className="w-4 h-4 text-purple-400" />
          <span>Resets to 0 upon any Legendary</span>
        </div>
      </div>
    </div>
  );
};
