import React, { useState } from 'react';
import { GameConfig } from '../types/game';
import { ShieldAlert, Sliders, DollarSign, Download, PauseCircle, PlayCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface AdminPanelProps {
  config: GameConfig;
  onUpdateWeights: (common: number, rare: number, epic: number, legendary: number) => void;
  onUpdatePrice: (newPriceSui: number) => void;
  onWithdrawTreasury: () => void;
  onTogglePause: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  config,
  onUpdateWeights,
  onUpdatePrice,
  onWithdrawTreasury,
  onTogglePause,
}) => {
  const [common, setCommon] = useState<number>(config.commonWeight);
  const [rare, setRare] = useState<number>(config.rareWeight);
  const [epic, setEpic] = useState<number>(config.epicWeight);
  const [legendary, setLegendary] = useState<number>(config.legendaryWeight);

  const [priceInput, setPriceInput] = useState<string>((config.boxPriceMist / 1_000_000_000).toString());

  const currentSum = common + rare + epic + legendary;
  const isSumValid = currentSum === 100;

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSumValid) return;
    onUpdateWeights(common, rare, epic, legendary);
  };

  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(priceInput);
    if (!isNaN(val) && val > 0) {
      onUpdatePrice(val);
    }
  };

  const treasurySui = (config.treasuryBalanceMist / 1_000_000_000).toFixed(3);

  return (
    <div className="space-y-8">

      {/* Admin Auth Notice */}
      <div className="rounded-3xl glass-panel-glow p-6 sm:p-8 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <ShieldAlert className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-extrabold text-white font-['Cinzel',serif]">
              Admin Capability Control Center
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            Operations here require possession of the on-chain <code className="text-purple-300 font-mono">AdminCap</code> capability object.
          </p>
        </div>

        {/* Pause Switch */}
        <button
          onClick={onTogglePause}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${config.isPaused
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
            }`}
        >
          {config.isPaused ? (
            <>
              <PlayCircle className="w-4 h-4" />
              <span>Resume Game (Unpause)</span>
            </>
          ) : (
            <>
              <PauseCircle className="w-4 h-4" />
              <span>Emergency Pause Contract</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Dynamic Rarity Weights Adjustment */}
        <div className="lg:col-span-7 rounded-3xl glass-panel p-6 sm:p-8 border border-sui-border space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Adjust Drop Rate Weights
            </h3>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${isSumValid
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border-red-500/40'
                }`}
            >
              Sum: {currentSum} / 100
            </span>
          </div>

          <form onSubmit={handleSaveWeights} className="space-y-4">

            {/* Common */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Common Tier Weight:</span>
                <span className="font-mono text-slate-400">{common}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="90"
                value={common}
                onChange={(e) => setCommon(parseInt(e.target.value))}
                className="w-full accent-slate-400"
              />
            </div>

            {/* Rare */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Rare Tier Weight:</span>
                <span className="font-mono text-sky-400">{rare}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="80"
                value={rare}
                onChange={(e) => setRare(parseInt(e.target.value))}
                className="w-full accent-sky-400"
              />
            </div>

            {/* Epic */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Epic Tier Weight:</span>
                <span className="font-mono text-purple-400">{epic}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={epic}
                onChange={(e) => setEpic(parseInt(e.target.value))}
                className="w-full accent-purple-400"
              />
            </div>

            {/* Legendary */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Legendary Tier Weight:</span>
                <span className="font-mono text-amber-400">{legendary}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={legendary}
                onChange={(e) => setLegendary(parseInt(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>

            {!isSumValid && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 p-3 rounded-xl border border-red-900/50">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>The sum of weights must equal exactly 100% to ensure fair distribution.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!isSumValid}
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition ${isSumValid
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/25 hover:brightness-110'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
            >
              Apply Weight Changes On-Chain
            </button>
          </form>
        </div>

        {/* Right: Price & Treasury Actions */}
        <div className="lg:col-span-5 space-y-6">

          {/* Price Changer */}
          <div className="rounded-3xl glass-panel p-6 border border-sui-border space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Update Box Price
            </h3>

            <form onSubmit={handleSavePrice} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">
                  New Price per Box (in SUI):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs uppercase tracking-wider transition border border-slate-700"
              >
                Update Price
              </button>
            </form>
          </div>

          {/* Treasury Withdrawal */}
          <div className="rounded-3xl glass-panel p-6 border border-sui-border space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-amber-400" />
              Treasury Balance Withdrawal
            </h3>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[11px] text-slate-400 block">Available SUI in Treasury:</span>
                <span className="text-xl font-extrabold font-mono text-amber-300">
                  {treasurySui} SUI
                </span>
              </div>
              <button
                onClick={onWithdrawTreasury}
                disabled={config.treasuryBalanceMist <= 0}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition ${config.treasuryBalanceMist > 0
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
              >
                Withdraw
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
