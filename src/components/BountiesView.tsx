import React from 'react';
import { Trophy, Clock, Users, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { BountyChallenge } from '../types';
import { BOUNTY_CHALLENGES } from '../data/seedData';

interface BountiesViewProps {
  onJoinBounty: (bountyId: string) => void;
  onFilterByTag: (tag: string) => void;
}

export const BountiesView: React.FC<BountiesViewProps> = ({
  onJoinBounty,
  onFilterByTag,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Trophy className="w-4 h-4" />
            <span>Brand Sponsor Prize Pools</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Post Videos. Complete Bounties. Earn Direct Cash Rewards.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Brands deposit guaranteed prize pools into escrow. Creators post short-form videos matching the challenge brief. Top-voted and standout creators win payouts directly into their VidPulse wallet.
          </p>
        </div>

        <div className="relative z-10 shrink-0 bg-slate-950/80 border border-slate-800 p-5 rounded-2xl text-center space-y-1">
          <span className="text-[11px] text-slate-400 block uppercase tracking-wider">
            Active Prize Escrow
          </span>
          <span className="text-3xl font-black text-amber-400 font-mono tabular-nums">
            $12,500.00
          </span>
          <span className="text-[11px] text-emerald-400 block font-semibold">
            Across 3 active challenges
          </span>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Bounties List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BOUNTY_CHALLENGES.map((bounty) => (
          <div
            key={bounty.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:border-slate-700 transition-all shadow-xl group"
          >
            {/* Banner Thumbnail with 16:9 ratio */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
              <img
                src={bounty.bannerUrl}
                alt={bounty.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-mono text-amber-300 border border-amber-400/30">
                {bounty.tag}
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">{bounty.sponsor}</span>
                <span className="text-sm font-black text-amber-400 font-mono tabular-nums">
                  ${bounty.rewardPool.toLocaleString()} Pool
                </span>
              </div>
            </div>

            {/* Bounty Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                  {bounty.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {bounty.description}
                </p>

                {/* Brief Rules */}
                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-300 block">
                    Submission Criteria:
                  </span>
                  {bounty.requirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bounty Footer with stats and CTA */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                {/* Clean unboxed metadata per §1.A */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{bounty.deadline}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-mono tabular-nums">{bounty.submissionsCount} submissions</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onFilterByTag(bounty.tag)}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center truncate"
                  >
                    View Entries
                  </button>
                  <button
                    onClick={() => onJoinBounty(bounty.id)}
                    className="py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm shadow-amber-400/20 active:scale-95"
                  >
                    <span>Submit Video</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
