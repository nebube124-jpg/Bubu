import React from 'react';
import { Plus, Wallet, Video, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'feed' | 'bounties' | 'studio' | 'wallet' | 'leaderboard';
  onSelectTab: (tab: 'feed' | 'bounties' | 'studio' | 'wallet' | 'leaderboard') => void;
  onOpenPostModal: () => void;
  walletBalance: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenPostModal,
  walletBalance,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => onSelectTab('feed')}
          className="text-xl font-bold tracking-tight text-white hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer text-left"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-black text-sm">
            ▶
          </span>
          <span>VidPulse</span>
        </button>

        {/* Zone 2: 4–5 single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => onSelectTab('feed')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'feed'
                ? 'text-white border-b-2 border-amber-400 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Feed
          </button>
          <button
            onClick={() => onSelectTab('bounties')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'bounties'
                ? 'text-white border-b-2 border-amber-400 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Bounties
          </button>
          <button
            onClick={() => onSelectTab('studio')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'studio'
                ? 'text-white border-b-2 border-amber-400 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Creator Studio
          </button>
          <button
            onClick={() => onSelectTab('wallet')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              activeTab === 'wallet'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            <Wallet className="w-4 h-4 text-amber-400" />
            <span>Wallet (${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
          </button>
          <button
            onClick={() => onSelectTab('leaderboard')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'leaderboard'
                ? 'text-white border-b-2 border-amber-400 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Leaderboard
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenPostModal}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all duration-150 flex items-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer whitespace-nowrap shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Post Video</span>
          </button>
        </div>
      </div>
    </header>
  );
};
