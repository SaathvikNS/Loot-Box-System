import React from 'react';
import { Package, Shield, Sparkles, Coins, RefreshCw, Layers, ExternalLink } from 'lucide-react';

interface NavbarProps {
  userAddress: string;
  userBalanceSui: number;
  onClaimFaucet: () => void;
  onResetDemo: () => void;
  activeTab: 'bay' | 'armory' | 'pity' | 'admin' | 'logs';
  setActiveTab: (tab: 'bay' | 'armory' | 'pity' | 'admin' | 'logs') => void;
  inventoryCount: number;
  ownedBoxesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  userAddress,
  userBalanceSui,
  onClaimFaucet,
  onResetDemo,
  activeTab,
  setActiveTab,
  inventoryCount,
  ownedBoxesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#070B19]/80 border-b border-sui-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('bay')}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/40">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 bg-clip-text text-transparent font-['Cinzel',serif]">
                  SUI LOOTBOX
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  sui::random
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Verifiable Native Randomness & Dynamic Fields Pity Engine</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-sui-dark/60 p-1.5 rounded-xl border border-sui-border/50">
            <button
              onClick={() => setActiveTab('bay')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'bay'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
            >
              <Package className="w-4 h-4" />
              <span>Unboxing Bay</span>
              {ownedBoxesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-cyan-400 text-slate-950 font-bold">
                  {ownedBoxesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('armory')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'armory'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
            >
              <Shield className="w-4 h-4" />
              <span>NFT Armory</span>
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-slate-700 text-slate-300 font-bold">
                {inventoryCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pity')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'pity'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Pity & Drop Rates</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'admin'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
            >
              <Layers className="w-4 h-4" />
              <span>Admin Cap</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'logs'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
            >
              <span>On-Chain Logs</span>
            </button>
          </nav>

          {/* User Wallet Info & Actions */}
          <div className="flex items-center space-x-3">
            {/* Balance Pill */}
            <div className="flex items-center space-x-2 bg-sui-dark/80 border border-sui-border px-3.5 py-1.5 rounded-xl shadow-inner">
              <Coins className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-400">Balance: </span>
                <span className="font-mono font-bold text-sm text-cyan-300">
                  {userBalanceSui.toFixed(2)} SUI
                </span>
              </div>
              <button
                onClick={onClaimFaucet}
                title="Claim 10 testnet SUI tokens"
                className="ml-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-500 px-2 py-0.5 rounded transition shadow-sm"
              >
                +Faucet
              </button>
            </div>

            {/* User Address Pill */}
            <div className="hidden lg:flex items-center space-x-2 bg-slate-900/80 border border-slate-700/60 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{userAddress}</span>
            </div>

            {/* Reset Button */}
            <button
              onClick={onResetDemo}
              title="Reset Demo State"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex overflow-x-auto space-x-2 py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('bay')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${activeTab === 'bay' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
          >
            Unboxing Bay ({ownedBoxesCount})
          </button>
          <button
            onClick={() => setActiveTab('armory')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${activeTab === 'armory' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
          >
            Armory ({inventoryCount})
          </button>
          <button
            onClick={() => setActiveTab('pity')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${activeTab === 'pity' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
          >
            Pity & Rates
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${activeTab === 'admin' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
          >
            Admin
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${activeTab === 'logs' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
          >
            Logs
          </button>
        </div>
      </div>
    </header>
  );
};
