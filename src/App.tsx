import React, { useState } from 'react';
import {
  Flame,
  Trophy,
  PlusCircle,
  Video,
  Wallet,
  Users,
  Sparkles,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { VideoFeed } from './components/VideoFeed';
import { BountiesView } from './components/BountiesView';
import { StudioProfileView } from './components/StudioProfileView';
import { WalletView } from './components/WalletView';
import { LeaderboardView } from './components/LeaderboardView';
import { PostVideoModal } from './components/PostVideoModal';
import {
  INITIAL_VIDEOS,
  INITIAL_COMMENTS,
  INITIAL_WALLET,
  CURRENT_USER,
} from './data/seedData';
import { VideoItem, CommentItem, CreatorWallet, PayoutRecord } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'bounties' | 'studio' | 'wallet' | 'leaderboard'>('feed');
  const [videos, setVideos] = useState<VideoItem[]>(INITIAL_VIDEOS);
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentItem[]>>(INITIAL_COMMENTS);
  const [wallet, setWallet] = useState<CreatorWallet>(INITIAL_WALLET);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [followedCreatorIds, setFollowedCreatorIds] = useState<Set<string>>(
    new Set(['creator_marcus'])
  );

  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [initialBountyForPost, setInitialBountyForPost] = useState<string | undefined>();
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Like video
  const handleLikeToggle = (videoId: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      const isCurrentlyLiked = next.has(videoId);

      if (isCurrentlyLiked) {
        next.delete(videoId);
      } else {
        next.add(videoId);
        // Small creator fund boost for high engagement
        setWallet((w) => ({
          ...w,
          creatorFundEarned: w.creatorFundEarned + 0.1,
          availableBalance: w.availableBalance + 0.1,
          totalEarned: w.totalEarned + 0.1,
        }));
      }

      setVideos((vList) =>
        vList.map((v) =>
          v.id === videoId
            ? { ...v, likes: v.likes + (isCurrentlyLiked ? -1 : 1) }
            : v
        )
      );

      return next;
    });
  };

  // Follow creator
  const handleFollowToggle = (creatorId: string) => {
    setFollowedCreatorIds((prev) => {
      const next = new Set(prev);
      if (next.has(creatorId)) {
        next.delete(creatorId);
        showToast('Unfollowed creator');
      } else {
        next.add(creatorId);
        showToast('Now following creator! Updates in your feed.');
      }
      return next;
    });
  };

  // Send tip / super gift to creator
  const handleSendTip = (
    videoId: string,
    amount: number,
    giftName: string,
    message: string
  ) => {
    // 1. Update video tips amount & tip goal
    setVideos((vList) =>
      vList.map((v) => {
        if (v.id === videoId) {
          const newTips = v.tipsAmount + amount;
          const updatedGoal = v.tipGoal
            ? { ...v.tipGoal, current: v.tipGoal.current + amount }
            : undefined;
          return {
            ...v,
            tipsAmount: newTips,
            tipGoal: updatedGoal,
            commentsCount: v.commentsCount + 1,
          };
        }
        return v;
      })
    );

    // 2. Add VIP tip comment
    const newComment: CommentItem = {
      id: `tip_${Date.now()}`,
      videoId,
      user: {
        name: CURRENT_USER.name,
        handle: CURRENT_USER.handle,
        avatarUrl: CURRENT_USER.avatarUrl,
      },
      text: message,
      likes: 1,
      createdAt: 'Just now',
      tipAmount: amount,
      giftName,
    };

    setCommentsMap((prev) => ({
      ...prev,
      [videoId]: [newComment, ...(prev[videoId] || [])],
    }));

    // 3. Deposit into creator wallet
    setWallet((w) => ({
      ...w,
      availableBalance: w.availableBalance + amount,
      tipsEarned: w.tipsEarned + amount,
      totalEarned: w.totalEarned + amount,
    }));

    showToast(`🎉 Sent $${amount.toFixed(2)} ${giftName}! Deposited to creator balance.`);
  };

  // Add comment
  const handleAddComment = (videoId: string, text: string) => {
    const newComment: CommentItem = {
      id: `c_${Date.now()}`,
      videoId,
      user: {
        name: CURRENT_USER.name,
        handle: CURRENT_USER.handle,
        avatarUrl: CURRENT_USER.avatarUrl,
      },
      text,
      likes: 0,
      createdAt: 'Just now',
    };

    setCommentsMap((prev) => ({
      ...prev,
      [videoId]: [...(prev[videoId] || []), newComment],
    }));

    setVideos((vList) =>
      vList.map((v) =>
        v.id === videoId ? { ...v, commentsCount: v.commentsCount + 1 } : v
      )
    );

    showToast('Comment posted!');
  };

  // Publish video
  const handlePublishVideo = (newVideo: VideoItem) => {
    setVideos((prev) => [newVideo, ...prev]);

    // Give a creator post bonus ($15 from creator engagement fund)
    const bonus = 15.0;
    setWallet((w) => ({
      ...w,
      availableBalance: w.availableBalance + bonus,
      creatorFundEarned: w.creatorFundEarned + bonus,
      totalEarned: w.totalEarned + bonus,
    }));

    setActiveTab('feed');
    showToast(`🚀 Video published live! Received $${bonus.toFixed(2)} Creator Post Bonus.`);
  };

  // Handle cashout withdrawal
  const handleWithdraw = (record: PayoutRecord) => {
    setWallet((w) => ({
      ...w,
      availableBalance: Math.max(0, w.availableBalance - record.amount),
      payoutHistory: [record, ...w.payoutHistory],
    }));
    showToast(`💰 Payout of $${record.amount.toFixed(2)} sent via ${record.method}!`);
  };

  // Trigger post modal with specific bounty challenge
  const handleJoinBounty = (bountyId: string) => {
    setInitialBountyForPost(bountyId);
    setIsPostModalOpen(true);
  };

  // Filter video feed by hashtag
  const handleFilterByTag = (tag: string) => {
    setActiveTagFilter(tag);
    setActiveTab('feed');
  };

  const userVideos = videos.filter((v) => v.creator.id === CURRENT_USER.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-8">
      {/* Top Bar Contract (§2) */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'feed') setActiveTagFilter(null);
        }}
        onOpenPostModal={() => {
          setInitialBountyForPost(undefined);
          setIsPostModalOpen(true);
        }}
        walletBalance={wallet.availableBalance}
      />

      {/* Floating System Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-amber-400/40 text-amber-300 px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 w-full">
        {activeTab === 'feed' && (
          <VideoFeed
            videos={videos}
            likedIds={likedIds}
            followedCreatorIds={followedCreatorIds}
            onLikeToggle={handleLikeToggle}
            onFollowToggle={handleFollowToggle}
            onSendTip={handleSendTip}
            onAddComment={handleAddComment}
            commentsMap={commentsMap}
            onSelectBounty={handleJoinBounty}
            activeTagFilter={activeTagFilter}
            onClearTagFilter={() => setActiveTagFilter(null)}
            onSetTagFilter={handleFilterByTag}
          />
        )}

        {activeTab === 'bounties' && (
          <BountiesView
            onJoinBounty={handleJoinBounty}
            onFilterByTag={handleFilterByTag}
          />
        )}

        {activeTab === 'studio' && (
          <StudioProfileView
            userVideos={userVideos}
            wallet={wallet}
            onOpenPostModal={() => {
              setInitialBountyForPost(undefined);
              setIsPostModalOpen(true);
            }}
            onSelectVideoForFeed={(videoId) => {
              setActiveTab('feed');
            }}
          />
        )}

        {activeTab === 'wallet' && (
          <WalletView
            wallet={wallet}
            onWithdraw={handleWithdraw}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            onFollowToggle={handleFollowToggle}
            followedIds={followedCreatorIds}
          />
        )}
      </main>

      {/* Post Video Studio Modal */}
      <PostVideoModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPublishVideo={handlePublishVideo}
        initialBountyId={initialBountyForPost}
      />

      {/* Mobile Fixed Bottom Navigation Bar (Pattern 1 from §3 / Mobile Reference) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-5 items-center h-16 pb-safe px-1">
        <button
          onClick={() => {
            setActiveTab('feed');
            setActiveTagFilter(null);
          }}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'feed' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('bounties')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'bounties' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Bounties</span>
        </button>

        <button
          onClick={() => {
            setInitialBountyForPost(undefined);
            setIsPostModalOpen(true);
          }}
          className="flex flex-col items-center justify-center py-1 cursor-pointer"
          aria-label="Post video"
        >
          <div className="w-10 h-10 -mt-3 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/30">
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-amber-400 tracking-tight mt-0.5">Post</span>
        </button>

        <button
          onClick={() => setActiveTab('studio')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'studio' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Video className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'wallet' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Wallet</span>
        </button>
      </div>
    </div>
  );
}
