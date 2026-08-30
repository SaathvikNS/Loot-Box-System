import React, { useState } from 'react';
import { GameItem, RarityTier, RARITY_INFO } from '../types/game';
import { Shield, Zap, Send, Flame, Filter, ArrowUpDown, X, Check, ExternalLink } from 'lucide-react';

interface InventoryGridProps {
  inventory: GameItem[];
  onTransfer: (itemId: string, recipient: string) => void;
  onBurn: (itemId: string) => void;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({
  inventory,
  onTransfer,
  onBurn,
}) => {
  const [selectedRarity, setSelectedRarity] = useState<RarityTier | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'power-desc' | 'power-asc' | 'serial-desc' | 'serial-asc'>('power-desc');

  // Modals state
  const [transferTarget, setTransferTarget] = useState<GameItem | null>(null);
  const [recipientInput, setRecipientInput] = useState<string>('');
  const [burnTarget, setBurnTarget] = useState<GameItem | null>(null);

  // Filter items
  const filtered = inventory.filter((item) => {
    if (selectedRarity === 'ALL') return true;
    return item.rarity === selectedRarity;
  });

  // Sort items
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'power-desc') return b.power - a.power;
    if (sortBy === 'power-asc') return a.power - b.power;
    if (sortBy === 'serial-desc') return b.serialNumber - a.serialNumber;
    return a.serialNumber - b.serialNumber;
  });

  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTarget || !recipientInput.trim()) return;
    onTransfer(transferTarget.id, recipientInput.trim());
    setTransferTarget(null);
    setRecipientInput('');
  };

  const handleConfirmBurn = () => {
    if (!burnTarget) return;
    onBurn(burnTarget.id);
    setBurnTarget(null);
  };

  return (
    <div className="space-y-6">

      {/* Controls Bar: Rarity Filter & Sorter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-sui-border">

        {/* Rarity Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedRarity('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedRarity === 'ALL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
          >
            All ({inventory.length})
          </button>

          {[0, 1, 2, 3].map((r) => {
            const tier = r as RarityTier;
            const count = inventory.filter(i => i.rarity === tier).length;
            const info = RARITY_INFO[tier];
            return (
              <button
                key={tier}
                onClick={() => setSelectedRarity(tier)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${selectedRarity === tier
                    ? 'text-white border shadow-md'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
                  }`}
                style={{
                  backgroundColor: selectedRarity === tier ? info.color + '33' : undefined,
                  borderColor: selectedRarity === tier ? info.color : 'transparent',
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: info.color }} />
                <span>{info.name}</span>
                <span className="font-mono text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
          >
            <option value="power-desc">Highest Power</option>
            <option value="power-asc">Lowest Power</option>
            <option value="serial-desc">Newest First</option>
            <option value="serial-asc">Oldest First</option>
          </select>
        </div>

      </div>

      {/* Inventory Grid */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-3xl glass-panel text-center border border-dashed border-slate-700">
          <Shield className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-300">No Game Items Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            {inventory.length === 0
              ? 'You do not hold any NFT game items yet. Purchase and open mystery crates to build your armory!'
              : 'No items match your selected rarity filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sorted.map((item) => {
            const info = RARITY_INFO[item.rarity];
            const maxTierPower = item.rarity === 0 ? 10 : item.rarity === 1 ? 25 : item.rarity === 2 ? 40 : 50;
            const powerRatio = Math.round((item.power / 50) * 100);

            return (
              <div
                key={item.id}
                className="rounded-2xl glass-panel p-4 flex flex-col justify-between holo-card border transition-all duration-300 hover:scale-[1.02] shadow-xl group"
                style={{ borderColor: info.color + '40' }}
              >
                <div>
                  {/* Card Image */}
                  <div className="relative w-full h-44 rounded-xl overflow-hidden mb-3 border border-slate-700/60">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

                    {/* Serial Tag */}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-mono font-bold text-slate-300 border border-slate-700">
                      #{item.serialNumber}
                    </span>

                    {/* Rarity Tag */}
                    <span className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wide border ${info.badgeBg}`}>
                      {info.name}
                    </span>

                    {/* Power Rating Badge */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
                      <span className="flex items-center gap-1 text-slate-300 font-semibold">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        Power Score:
                      </span>
                      <span className="font-mono font-extrabold text-cyan-300">
                        {item.power} / {maxTierPower}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h4 className="text-base font-bold text-white font-['Cinzel',serif] tracking-tight truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Power Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${powerRatio}%`,
                          backgroundColor: info.color,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions (Transfer & Burn) */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => setTransferTarget(item)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Transfer</span>
                  </button>

                  <button
                    onClick={() => setBurnTarget(item)}
                    className="py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 text-xs font-bold flex items-center justify-center gap-1 border border-red-900/50 transition"
                    title="Burn and destroy NFT"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Burn</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Transfer Modal */}
      {transferTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0E1738] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setTransferTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Send className="w-5 h-5 text-cyan-400" />
              Transfer Game Item NFT
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Transfer <strong>{transferTarget.name} #{transferTarget.serialNumber}</strong> to another Sui recipient address.
            </p>

            <form onSubmit={handleConfirmTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recipient Sui Address (0x...):
                </label>
                <input
                  type="text"
                  required
                  placeholder="0x9a8b7c6d5e4f3a2b1c0d9e8f..."
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferTarget(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Burn Modal */}
      {burnTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#1C0E14] border border-red-500/50 rounded-3xl p-6 shadow-2xl text-center">
            <Flame className="w-12 h-12 text-red-500 mx-auto mb-3 animate-pulse" />
            <h3 className="text-lg font-bold text-white mb-2">
              Destroy & Burn NFT?
            </h3>
            <p className="text-xs text-slate-300 mb-6">
              Are you sure you want to permanently burn <strong>{burnTarget.name} #{burnTarget.serialNumber}</strong>? This action deletes the object on-chain and is irreversible.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBurnTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Keep Item
              </button>
              <button
                type="button"
                onClick={handleConfirmBurn}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30"
              >
                Yes, Burn NFT
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
