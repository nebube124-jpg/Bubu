import React from 'react';
import {
  Video,
  Eye,
  Heart,
  DollarSign,
  Plus,
  Play,
  TrendingUp,
  Award,
} from 'lucide-react';
import { VideoItem, Creator, CreatorWallet } from '../types';
import { CURRENT_USER } from '../data/seedData';

interface StudioProfileViewProps {
  userVideos: VideoItem[];
  wallet: CreatorWallet;
  onOpenPostModal: () => void;
  onSelectVideoForFeed: (videoId: string) => void;
}

export const StudioProfileView: React.FC<StudioProfileViewProps> = ({
  userVideos,
  wallet,
  onOpenPostModal,
  onSelectVideoForFeed,
}) => {
  const totalViews = userVideos.reduce((acc, v) => acc + v.views, 0);
  const totalLikes = userVideos.reduce((acc, v) => acc + v.likes, 0);
  const totalTips = userVideos.reduce((acc, v) => acc + v.tipsAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={CURRENT_USER.avatarUrl}
            alt={CURRENT_USER.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-amber-400 shadow-xl"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{CURRENT_USER.name}</h2>
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                Verified Creator
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">{CURRENT_USER.handle}</p>
            <p className="text-xs text-slate-300 max-w-lg mt-1">{CURRENT_USER.bio}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPostModal}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-400/10 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Video</span>
          </button>
        </div>
      </div>

      {/* KPI Strip (§1.C: 4-column strip below profile) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Views</span>
            <Eye className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {totalViews.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500">Across {userVideos.length} posted videos</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Audience Likes</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {totalLikes.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500">Direct viewer appreciation</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Video Tips Earned</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
            ${totalTips.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-emerald-400">Instant deposits to wallet</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Creator Tier</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300 font-mono">
            Partner Pro
          </div>
          <p className="text-[10px] text-slate-500">90% revenue share unlocked</p>
        </div>
      </div>

      {/* Creator Videos Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Video className="w-4 h-4 text-amber-400" />
            <span>My Uploaded & Recorded Videos ({userVideos.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Click any card to play in feed</span>
        </div>

        {userVideos.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
            <p className="text-xs text-slate-400">
              You haven't posted any videos yet. Record from your camera or upload an MP4!
            </p>
            <button
              onClick={onOpenPostModal}
              className="px-4 py-2 bg-amber-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer"
            >
              Post Your First Video
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {userVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => onSelectVideoForFeed(video.id)}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-400/50 transition-all cursor-pointer group flex flex-col justify-between shadow-lg"
              >
                {/* 9:16 Video Thumbnail Container */}
                <div className="relative aspect-[9/16] max-h-[340px] w-full bg-slate-950 overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

                  {/* Play Overlay Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 fill-slate-950 translate-x-0.5" />
                    </div>
                  </div>

                  {/* Top Bounty / Tag */}
                  {video.bountyTag && (
                    <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 border border-amber-400/30">
                      {video.bountyTag}
                    </div>
                  )}

                  {/* Bottom Metrics Bar */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs font-mono text-white">
                    <span className="flex items-center gap-1 drop-shadow">
                      <Eye className="w-3.5 h-3.5 text-slate-300" />
                      {video.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 drop-shadow text-amber-300 font-bold">
                      <DollarSign className="w-3.5 h-3.5" />
                      ${video.tipsAmount.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Card Title & Tags */}
                <div className="p-3.5 space-y-2">
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                    {video.title}
                  </h4>
                  {/* Clean unboxed tags §1.A */}
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
                    <span>{video.createdAt}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-400/80 font-medium">
                      {video.tags[0] || '#Video'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
