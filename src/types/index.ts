export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  verified: boolean;
  followersCount: number;
  bio: string;
  totalEarnings: number;
}

export interface TipGoal {
  label: string;
  target: number;
  current: number;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  creator: Creator;
  videoUrl?: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  views: number;
  likes: number;
  tipsAmount: number; // in USD
  commentsCount: number;
  sharesCount: number;
  tags: string[];
  soundTitle: string;
  createdAt: string;
  tipGoal?: TipGoal;
  bountyId?: string;
  bountyTag?: string;
  filterStyle?: 'normal' | 'vibrant' | 'warm' | 'noir' | 'cyberpunk';
  aspectRatio?: '9:16' | '16:9' | '1:1';
}

export interface CommentItem {
  id: string;
  videoId: string;
  user: {
    name: string;
    handle: string;
    avatarUrl: string;
    isCreator?: boolean;
  };
  text: string;
  likes: number;
  createdAt: string;
  tipAmount?: number;
  giftName?: string;
  replies?: CommentItem[];
}

export interface TipGift {
  id: string;
  name: string;
  icon: string;
  amount: number; // USD
  description: string;
  sparkColor: string;
}

export interface BountyChallenge {
  id: string;
  title: string;
  sponsor: string;
  rewardPool: number;
  firstPrize: number;
  tag: string;
  deadline: string;
  submissionsCount: number;
  description: string;
  bannerUrl: string;
  requirements: string[];
}

export interface PayoutRecord {
  id: string;
  amount: number;
  method: 'PayPal' | 'Bank Wire' | 'Stripe' | 'USDC Crypto';
  destination: string;
  date: string;
  status: 'Completed' | 'Processing';
  txHash: string;
}

export interface CreatorWallet {
  totalEarned: number;
  availableBalance: number;
  tipsEarned: number;
  creatorFundEarned: number;
  bountiesEarned: number;
  payoutHistory: PayoutRecord[];
}
