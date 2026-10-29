import React from 'react';
import { Trophy, Medal, Sparkles, Heart, DollarSign, ArrowUpRight } from 'lucide-react';
import { Creator } from '../types';
import { SEED_CREATORS } from '../data/seedData';

interface LeaderboardViewProps {
  onFollowToggle: (creatorId: string) => void;
  followedIds: Set<string>;
  onSelectCreatorVideos?: (handle: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  onFollowToggle,
  followedIds,
  onSelectCreatorVideos,
}) => {
  const rankedCreators = [...SEED_CREATORS].sort((a, b) => b.totalEarnings - a.totalEarnings);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            <span>Weekly Payout Leaderboard</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Top Earning Creators on VidPulse
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ranked by direct viewer tips, creator fund milestones, and bounty challenge wins.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Resets every Sunday at 23:59 UTC</span>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {rankedCreators.slice(0, 3).map((creator, index) => {
          const rank = index + 1;
          const isFollowed = followedIds.has(creator.id);

          return (
            <div
              key={creator.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 relative overflow-hidden ${
                rank === 1
                  ? 'bg-gradient-to-b from-amber-500/10 to-slate-900 border-amber-500/40 shadow-xl shadow-amber-500/5'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="relative">
                  <img
                    src={creator.avatarUrl}
                    alt={creator.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-400"
                    referrerPolicy="no-referrer"
                  />
                  <div
                    className={`absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
                      rank === 1
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-950 font-black'
                        : 'bg-amber-700 text-white font-bold'
                    }`}
                  >
                    #{rank}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block uppercase tracking-wider">
                    Total Earned
                  </span>
                  <span className="text-xl font-extrabold text-amber-400 font-mono tabular-nums">
                    ${creator.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  {creator.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono">{creator.handle}</span>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {creator.bio}
                </p>
              </div>

              {/* Unboxed metadata §1.A */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-xs text-slate-400 font-mono tabular-nums">
                  {(creator.followersCount).toLocaleString()} followers
                </div>

                <button
                  onClick={() => onFollowToggle(creator.id)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    isFollowed
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold'
                  }`}
                >
                  {isFollowed ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Creator Fund Transparency Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>The VidPulse $1,200,000 Creator Fund Guarantee</span>
          </h4>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Unlike legacy social apps that keep 50–70% of ad revenue, VidPulse distributes 90% of viewer super-tips, 100% of brand challenge prize pools, and provides guaranteed video engagement disbursements directly to creator wallets.
          </p>
        </div>
        <div className="shrink-0">
          <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            Escrow Backed & Verified
          </span>
        </div>
      </div>
    </div>
  );
};
