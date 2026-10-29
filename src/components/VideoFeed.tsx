import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Flame, Users, Trophy, Sparkles, DollarSign } from 'lucide-react';
import { VideoItem, CommentItem } from '../types';
import { VideoCard } from './VideoCard';
import { TipModal } from './TipModal';
import { CommentsDrawer } from './CommentsDrawer';

interface VideoFeedProps {
  videos: VideoItem[];
  likedIds: Set<string>;
  followedCreatorIds: Set<string>;
  onLikeToggle: (id: string) => void;
  onFollowToggle: (creatorId: string) => void;
  onSendTip: (videoId: string, amount: number, giftName: string, message: string) => void;
  onAddComment: (videoId: string, text: string) => void;
  commentsMap: Record<string, CommentItem[]>;
  onSelectBounty?: (bountyId: string) => void;
  activeTagFilter: string | null;
  onClearTagFilter: () => void;
  onSetTagFilter: (tag: string) => void;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({
  videos,
  likedIds,
  followedCreatorIds,
  onLikeToggle,
  onFollowToggle,
  onSendTip,
  onAddComment,
  commentsMap,
  onSelectBounty,
  activeTagFilter,
  onClearTagFilter,
  onSetTagFilter,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [feedTab, setFeedTab] = useState<'trending' | 'following' | 'topEarned'>('trending');
  const [activeTipModalVideo, setActiveTipModalVideo] = useState<VideoItem | null>(null);
  const [activeCommentsVideo, setActiveCommentsVideo] = useState<VideoItem | null>(null);

  // Filter videos based on tabs / tag filter
  const displayedVideos = videos.filter((v) => {
    if (activeTagFilter) {
      return v.tags.includes(activeTagFilter) || v.bountyTag === activeTagFilter;
    }
    if (feedTab === 'following') {
      return followedCreatorIds.has(v.creator.id);
    }
    if (feedTab === 'topEarned') {
      return v.tipsAmount > 100;
    }
    return true;
  });

  // Keep index in bounds
  const safeIndex = Math.min(currentIndex, Math.max(0, displayedVideos.length - 1));
  const currentVideo = displayedVideos[safeIndex];

  // Keyboard navigation (Arrow Up / Down)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTipModalVideo || activeCommentsVideo) return;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        setCurrentIndex((prev) => Math.min(prev + 1, displayedVideos.length - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayedVideos.length, activeTipModalVideo, activeCommentsVideo]);

  const handleNext = () => {
    if (safeIndex < displayedVideos.length - 1) {
      setCurrentIndex(safeIndex + 1);
    }
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentIndex(safeIndex - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
      {/* Active tag indicator */}
      {activeTagFilter && (
        <div className="mb-4 flex items-center justify-between bg-slate-900 border border-amber-500/30 px-4 py-2 rounded-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300">Filtering by</span>
            <span className="text-xs font-bold text-amber-400">{activeTagFilter}</span>
          </div>
          <button
            onClick={onClearTagFilter}
            className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
          >
            Show All Videos
          </button>
        </div>
      )}

      {/* Main 3-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Feed Navigation & Quick Filters */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Discover Channels
            </h4>

            <button
              onClick={() => {
                setFeedTab('trending');
                setCurrentIndex(0);
                onClearTagFilter();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                feedTab === 'trending' && !activeTagFilter
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>For You Feed</span>
            </button>

            <button
              onClick={() => {
                setFeedTab('topEarned');
                setCurrentIndex(0);
                onClearTagFilter();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                feedTab === 'topEarned' && !activeTagFilter
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Highest Tipped</span>
            </button>

            <button
              onClick={() => {
                setFeedTab('following');
                setCurrentIndex(0);
                onClearTagFilter();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                feedTab === 'following' && !activeTagFilter
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Following ({followedCreatorIds.size})</span>
            </button>
          </div>

          {/* Monetization Tip Rules Notice */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>How Creators Get Paid</span>
            </div>
            <p className="leading-relaxed">
              Every video on VidPulse is eligible for direct viewer super-tips,
              community bounty prize pools, and the $1.2M creator engagement fund.
            </p>
            <div className="text-[11px] text-slate-500 pt-1">
              • Instant zero-fee tipping<br />
              • Payouts processed every Friday<br />
              • Transparent analytics
            </div>
          </div>
        </div>

        {/* Center Column: The Vertical Video Stage with Up/Down Controls */}
        <div className="lg:col-span-6 flex flex-col items-center">
          {displayedVideos.length === 0 ? (
            <div className="w-full h-[600px] flex flex-col items-center justify-center bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center">
              <Flame className="w-12 h-12 text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No videos found</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                No videos match the current filter. Try resetting or be the first to post a new video!
              </p>
              <button
                onClick={onClearTagFilter}
                className="px-4 py-2 bg-amber-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="relative w-full flex flex-col items-center">
              {/* Up / Down navigation buttons */}
              <div className="hidden lg:flex absolute -right-16 top-1/2 -translate-y-1/2 flex-col gap-2 z-10">
                <button
                  onClick={handlePrev}
                  disabled={safeIndex === 0}
                  className="w-11 h-11 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-lg"
                  aria-label="Previous video"
                >
                  <ChevronUp className="w-6 h-6" />
                </button>
                <div className="text-[11px] font-mono tabular-nums text-slate-400 text-center py-1">
                  {safeIndex + 1}/{displayedVideos.length}
                </div>
                <button
                  onClick={handleNext}
                  disabled={safeIndex >= displayedVideos.length - 1}
                  className="w-11 h-11 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-lg"
                  aria-label="Next video"
                >
                  <ChevronDown className="w-6 h-6" />
                </button>
              </div>

              {/* Current Active Video Card */}
              {currentVideo && (
                <VideoCard
                  video={currentVideo}
                  isActive={true}
                  onOpenTipModal={() => setActiveTipModalVideo(currentVideo)}
                  onOpenComments={() => setActiveCommentsVideo(currentVideo)}
                  onLikeToggle={onLikeToggle}
                  isLiked={likedIds.has(currentVideo.id)}
                  onFollowToggle={onFollowToggle}
                  isFollowed={followedCreatorIds.has(currentVideo.creator.id)}
                  onSelectTag={onSetTagFilter}
                />
              )}

              {/* Mobile next/prev swipe bar */}
              <div className="lg:hidden flex items-center justify-between w-full max-w-[420px] mt-3 px-2">
                <button
                  onClick={handlePrev}
                  disabled={safeIndex === 0}
                  className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-xs text-white rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-xs font-mono text-slate-400 tabular-nums">
                  {safeIndex + 1} of {displayedVideos.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={safeIndex >= displayedVideos.length - 1}
                  className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-xs text-white rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Tips Ticker & Creator Insights */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          {/* Live Recent Tips Stream */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Live Tips Stream</span>
              </h4>
              <span className="text-[11px] font-mono text-amber-400 font-bold">Real-time</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                <span className="text-xl">🚀</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    @sammycreates sent $50.00
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    to Alex Rivera (Super Rocket)
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                <span className="text-xl">💎</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    @dthorne sent $25.00
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    to Elena Vance (Diamond Spark)
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                <span className="text-xl">🎙️</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    @jordank sent $15.00
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    to Marcus Beatrix (Golden Mic)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Paid Bounty Spotlight */}
          <div className="bg-gradient-to-br from-amber-500/15 to-rose-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Active Bounty Sponsor</span>
            </div>
            <h5 className="text-sm font-bold text-white leading-snug">
              #FutureTech2026 Challenge
            </h5>
            <p className="text-xs text-slate-300">
              Submit your desk setup clip to win from the <strong className="text-amber-400 font-mono">$5,000</strong> cash pool.
            </p>
            <button
              onClick={() => onSelectBounty?.('bounty_tech_2026')}
              className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              View Bounty Details
            </button>
          </div>
        </div>
      </div>

      {/* Tip Modal */}
      {activeTipModalVideo && (
        <TipModal
          video={activeTipModalVideo}
          isOpen={true}
          onClose={() => setActiveTipModalVideo(null)}
          onSendTip={(amount, giftName, message) => {
            onSendTip(activeTipModalVideo.id, amount, giftName, message);
          }}
        />
      )}

      {/* Comments Drawer */}
      {activeCommentsVideo && (
        <CommentsDrawer
          video={activeCommentsVideo}
          isOpen={true}
          onClose={() => setActiveCommentsVideo(null)}
          comments={commentsMap[activeCommentsVideo.id] || []}
          onAddComment={(text) => onAddComment(activeCommentsVideo.id, text)}
          onOpenTipModal={() => {
            const vid = activeCommentsVideo;
            setActiveCommentsVideo(null);
            setActiveTipModalVideo(vid);
          }}
        />
      )}
    </div>
  );
};
