import React, { useState } from 'react';
import { LootBox, GameItem, GameConfig, PityTracker, RARITY_INFO } from '../types/game';
import { Package, Sparkles, Shield, ArrowRight, Zap, Flame, Award, X, Check } from 'lucide-react';

interface LootBoxOpenerProps {
  ownedBoxes: LootBox[];
  config: GameConfig;
  pity: PityTracker;
  isOpening: boolean;
  recentlyMintedItem: { item: GameItem; pityTriggered: boolean } | null;
  onPurchase: (count: number) => void;
  onOpen: (box?: LootBox) => void;
  onCloseModal: () => void;
  onNavigateToArmory: () => void;
}

export const LootBoxOpener: React.FC<LootBoxOpenerProps> = ({
  ownedBoxes,
  config,
  pity,
  isOpening,
  recentlyMintedItem,
  onPurchase,
  onOpen,
  onCloseModal,
  onNavigateToArmory,
}) => {
  const [purchaseAmount, setPurchaseAmount] = useState<number>(1);
  const boxPriceSui = config.boxPriceMist / 1_000_000_000;
  const isPityReady = pity.counter >= config.pityThreshold;

  return (
    <div className="space-y-8">
      {/* Main Opener Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

        {/* Left: 3D Mystery Box Visual & Opening Bay */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-8 rounded-3xl glass-panel-glow relative min-h-[460px] overflow-hidden border border-cyan-500/30">

          {/* Animated Background Rays */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-96 h-96 rounded-full blur-3xl transition-all duration-1000 ${isOpening
                ? 'bg-gradient-to-tr from-cyan-400 via-purple-500 to-amber-400 opacity-60 scale-125 animate-pulse-fast'
                : isPityReady
                  ? 'bg-amber-500/20 opacity-50 animate-pulse'
                  : 'bg-cyan-500/15 opacity-40'
              }`} />
          </div>

          {/* Interactive Loot Box Object */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`relative transition-all duration-300 ${isOpening ? 'animate-shake scale-110' : 'hover:scale-105'
              }`}>

              {/* Box Glow Ring */}
              <div className={`absolute -inset-4 rounded-3xl blur-xl transition-all ${isOpening
                  ? 'bg-gradient-to-r from-amber-400 via-purple-500 to-cyan-400 opacity-90 animate-spin'
                  : isPityReady
                    ? 'bg-amber-400/40 opacity-70 animate-pulse'
                    : 'bg-cyan-500/30 opacity-50'
                }`} />

              {/* The Mystery Crate Container */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl bg-gradient-to-b from-[#1C2A58] via-[#101B3B] to-[#0A1124] border-2 border-cyan-400/40 shadow-2xl p-4 flex flex-col items-center justify-center group cursor-pointer select-none">

                {/* Cybernetic Accent Lines */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

                {/* Holographic Center Core */}
                <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center shadow-inner transition-transform duration-500 ${isOpening
                    ? 'bg-gradient-to-tr from-amber-500 to-purple-600 animate-spin'
                    : isPityReady
                      ? 'bg-gradient-to-tr from-amber-500/30 to-yellow-400/30 border border-amber-400/60 animate-pulse'
                      : 'bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 group-hover:scale-110'
                  }`}>
                  <Package className={`w-16 h-16 sm:w-20 sm:h-20 transition-colors ${isPityReady ? 'text-amber-300 animate-bounce' : 'text-cyan-300 group-hover:text-white'
                    }`} />
                </div>

                <div className="mt-4 text-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block">
                    {isPityReady ? '⭐ LEGENDARY PRIMED ⭐' : 'MYSTERY REWARD'}
                  </span>
                  <span className="text-sm font-extrabold text-slate-200">
                    Sui On-Chain Randomness NFT
                  </span>
                </div>
              </div>
            </div>

            {/* Open Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
              <button
                disabled={ownedBoxes.length === 0 || isOpening || config.isPaused}
                onClick={() => onOpen()}
                className={`w-full py-4 px-6 rounded-2xl font-extrabold text-base uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl transition-all ${ownedBoxes.length === 0 || config.isPaused
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : isOpening
                      ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white animate-pulse'
                      : isPityReady
                        ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 hover:brightness-110 shadow-amber-500/30 hover:scale-[1.02]'
                        : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white hover:brightness-110 shadow-cyan-500/30 hover:scale-[1.02]'
                  }`}
              >
                <Sparkles className={`w-5 h-5 ${isOpening ? 'animate-spin' : ''}`} />
                <span>
                  {isOpening
                    ? 'Consuming sui::random Beacon...'
                    : ownedBoxes.length === 0
                      ? 'No Boxes Available'
                      : `Open Box (${ownedBoxes.length} Owned)`}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Purchase & Economy Store */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6 rounded-3xl glass-panel p-6 sm:p-8 border border-sui-border">

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-extrabold text-white font-['Cinzel',serif]">
                Purchase Mystery Loot Boxes
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold font-mono">
                {boxPriceSui} SUI / box
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Each unopened LootBox is a unique Sui owned object with full transferability until cracked open with native randomness.
            </p>
          </div>

          {/* Quick Select Quantity */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Quantity:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 5, 10, 25].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setPurchaseAmount(qty)}
                  className={`py-2.5 rounded-xl font-bold text-sm transition-all border ${purchaseAmount === qty
                      ? 'bg-blue-600 text-white border-cyan-400 shadow-md shadow-blue-500/30'
                      : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                >
                  {qty}x
                </button>
              ))}
            </div>
          </div>

          {/* Cost Summary Box */}
          <div className="bg-sui-dark/90 border border-slate-700/80 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Price per unit:</span>
              <span className="font-mono text-slate-200">{boxPriceSui} SUI</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Quantity:</span>
              <span className="font-mono text-slate-200">{purchaseAmount}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-white">
              <span>Total Cost:</span>
              <span className="text-cyan-300 font-mono text-base font-extrabold">
                {(boxPriceSui * purchaseAmount).toFixed(2)} SUI
              </span>
            </div>
          </div>

          {/* Purchase Button */}
          <button
            disabled={config.isPaused}
            onClick={() => onPurchase(purchaseAmount)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white font-extrabold text-base uppercase tracking-wider shadow-lg shadow-blue-500/25 hover:brightness-110 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 text-yellow-300" />
            <span>Buy {purchaseAmount} Mystery Box{purchaseAmount > 1 ? 'es' : ''}</span>
          </button>

          {/* Live Owned Boxes Inventory Bar */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Unopened Inventory:</span>
            <span className="font-bold text-white font-mono bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              {ownedBoxes.length} Boxes Ready
            </span>
          </div>

        </div>

      </div>

      {/* REVEAL MODAL: Newly Minted GameItem NFT */}
      {recentlyMintedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0D1636] border-2 border-cyan-400/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/30 flex flex-col items-center text-center animate-scale-up">

            {/* Close Button */}
            <button
              onClick={onCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pity / Legendary Banner */}
            {recentlyMintedItem.pityTriggered ? (
              <div className="mb-3 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-lg">
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Pity Guarantee Triggered!</span>
              </div>
            ) : recentlyMintedItem.item.rarity === 3 ? (
              <div className="mb-3 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-lg">
                <Flame className="w-4 h-4 fill-current" />
                <span>LEGENDARY ITEM MINTED!</span>
              </div>
            ) : null}

            {/* NFT Artwork Image with Rarity Aura */}
            <div className="relative my-4 w-48 h-48 rounded-2xl overflow-hidden border-2 shadow-2xl" style={{ borderColor: RARITY_INFO[recentlyMintedItem.item.rarity].color }}>
              <img
                src={recentlyMintedItem.item.imageUrl}
                alt={recentlyMintedItem.item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              {/* Power Overlay */}
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-xs font-bold text-white px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  Power:
                </span>
                <span className="font-mono text-cyan-300 font-extrabold">{recentlyMintedItem.item.power}</span>
              </div>
            </div>

            {/* Item Details */}
            <span className={`text-xs uppercase font-extrabold px-3 py-0.5 rounded-full border mb-1.5 ${RARITY_INFO[recentlyMintedItem.item.rarity].badgeBg}`}>
              {RARITY_INFO[recentlyMintedItem.item.rarity].name} Tier
            </span>

            <h3 className="text-xl font-extrabold text-white font-['Cinzel',serif]">
              {recentlyMintedItem.item.name}
            </h3>

            <p className="text-xs text-slate-400 mt-1 mb-4 max-w-xs">
              {recentlyMintedItem.item.description}
            </p>

            <div className="w-full bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-xs font-mono text-slate-300 space-y-1 mb-6 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">NFT Serial #:</span>
                <span className="font-bold text-cyan-400">#{recentlyMintedItem.item.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Power Level:</span>
                <span className="font-bold text-yellow-400">{recentlyMintedItem.item.power} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Object ID:</span>
                <span className="text-slate-400 truncate max-w-[180px]">{recentlyMintedItem.item.id}</span>
              </div>
            </div>

            {/* Action buttons inside reveal modal */}
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={onCloseModal}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition"
              >
                Keep & Close
              </button>
              <button
                onClick={() => {
                  onCloseModal();
                  onNavigateToArmory();
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 transition"
              >
                <span>View Armory</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
