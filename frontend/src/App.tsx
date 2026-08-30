import React, { useState } from 'react';
import { useSuiGame } from './hooks/useSuiGame';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { LootBoxOpener } from './components/LootBoxOpener';
import { PityTrackerWidget } from './components/PityTrackerWidget';
import { InventoryGrid } from './components/InventoryGrid';
import { RarityDistribution } from './components/RarityDistribution';
import { AdminPanel } from './components/AdminPanel';
import { TransactionLogs } from './components/TransactionLogs';
import { Sparkles, CheckCircle2, AlertCircle, Info, Github } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'bay' | 'armory' | 'pity' | 'admin' | 'logs'>('bay');

  const {
    userAddress,
    userBalanceSui,
    ownedBoxes,
    inventory,
    pityTracker,
    gameConfig,
    events,
    isOpening,
    recentlyMintedItem,
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
  } = useSuiGame();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#070B19]">

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center space-x-2 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border text-xs font-semibold ${toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50 shadow-emerald-500/20'
                : toastMessage.type === 'error'
                  ? 'bg-red-950/90 text-red-200 border-red-500/50 shadow-red-500/20'
                  : 'bg-blue-950/90 text-cyan-200 border-cyan-500/50 shadow-cyan-500/20'
              }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400" />
            ) : (
              <Info className="w-4 h-4 text-cyan-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Header / Navigation */}
      <Navbar
        userAddress={userAddress}
        userBalanceSui={userBalanceSui}
        onClaimFaucet={claimTestnetFaucet}
        onResetDemo={resetDemoState}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        inventoryCount={inventory.length}
        ownedBoxesCount={ownedBoxes.length}
      />

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">

        {/* Global Hero Header */}
        <HeroBanner config={gameConfig} />

        {/* Global Pity Gauge shown across Opener & Armory */}
        {(activeTab === 'bay' || activeTab === 'armory') && (
          <PityTrackerWidget pity={pityTracker} config={gameConfig} />
        )}

        {/* Tab 1: Unboxing Bay */}
        {activeTab === 'bay' && (
          <LootBoxOpener
            ownedBoxes={ownedBoxes}
            config={gameConfig}
            pity={pityTracker}
            isOpening={isOpening}
            recentlyMintedItem={recentlyMintedItem}
            onPurchase={purchaseLootBox}
            onOpen={openLootBox}
            onCloseModal={() => setRecentlyMintedItem(null)}
            onNavigateToArmory={() => setActiveTab('armory')}
          />
        )}

        {/* Tab 2: NFT Armory & Inventory */}
        {activeTab === 'armory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-white font-['Cinzel',serif]">
                  Player NFT Armory
                </h2>
                <p className="text-xs text-slate-400">
                  Inspect stats, power levels, transfer ownership, or burn items.
                </p>
              </div>
            </div>
            <InventoryGrid
              inventory={inventory}
              onTransfer={transferItem}
              onBurn={burnItem}
            />
          </div>
        )}

        {/* Tab 3: Rarity Distribution & Math */}
        {activeTab === 'pity' && (
          <RarityDistribution config={gameConfig} />
        )}

        {/* Tab 4: Admin Capability Controls */}
        {activeTab === 'admin' && (
          <AdminPanel
            config={gameConfig}
            onUpdateWeights={updateWeights}
            onUpdatePrice={updatePrice}
            onWithdrawTreasury={withdrawTreasury}
            onTogglePause={togglePause}
          />
        )}

        {/* Tab 5: Live Event Logs */}
        {activeTab === 'logs' && (
          <TransactionLogs events={events} />
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#060914] py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-300 font-['Cinzel',serif]">Sui Move Gaming Ecosystem</span>
            <span>•</span>
            <span className="text-cyan-400">sui::random Verifiable Beacon</span>
          </div>
          <div className="text-slate-500">
            Powered by Sui 2024 Edition Object Model & Dynamic Fields Pity System
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
