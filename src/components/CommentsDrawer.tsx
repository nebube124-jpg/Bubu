import React, { useState } from 'react';
import { X, Heart, Send, Sparkles, MessageCircle } from 'lucide-react';
import { CommentItem, VideoItem } from '../types';
import { soundEffects } from '../utils/audio';

interface CommentsDrawerProps {
  video: VideoItem;
  isOpen: boolean;
  onClose: () => void;
  comments: CommentItem[];
  onAddComment: (text: string) => void;
  onOpenTipModal: () => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  video,
  isOpen,
  onClose,
  comments,
  onAddComment,
  onOpenTipModal,
}) => {
  const [filter, setFilter] = useState<'all' | 'tips'>('all');
  const [inputText, setInputText] = useState('');
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const filteredComments = comments.filter((c) => {
    if (filter === 'tips') return !!c.tipAmount;
    return true;
  });

  const handleLike = (id: string) => {
    soundEffects.playLikePop();
    setLikedCommentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddComment(inputText.trim());
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Comments ({comments.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar (Interactive segmented button control per §1.A) */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Comments ({comments.length})
            </button>
            <button
              onClick={() => setFilter('tips')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                filter === 'tips'
                  ? 'bg-amber-400/20 text-amber-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Super Tips ({comments.filter((c) => !!c.tipAmount).length})</span>
            </button>
          </div>

          <button
            onClick={onOpenTipModal}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Send Tip</span>
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredComments.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              {filter === 'tips' ? 'No super tips yet. Be the first to tip!' : 'No comments yet. Start the conversation!'}
            </div>
          ) : (
            filteredComments.map((item) => {
              const isLiked = likedCommentIds.has(item.id);
              const likeCount = item.likes + (isLiked ? 1 : 0);

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl transition-all ${
                    item.tipAmount
                      ? 'bg-amber-500/10 border border-amber-500/30'
                      : 'bg-slate-950/40 border border-slate-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <img
                        src={item.user.avatarUrl}
                        alt={item.user.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-white">
                            {item.user.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {item.user.handle}
                          </span>
                          {item.user.isCreator && (
                            <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded">
                              Creator
                            </span>
                          )}
                          {item.tipAmount && (
                            <span className="text-xs font-bold font-mono text-amber-300 flex items-center gap-0.5 ml-1">
                              ⚡ ${item.tipAmount.toFixed(2)}
                              {item.giftName && ` (${item.giftName})`}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {item.text}
                        </p>
                        {/* Clean unboxed metadata with separators §1.A */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
                          <span>{item.createdAt}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{likeCount} likes</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLike(item.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                        isLiked
                          ? 'text-rose-500 bg-rose-500/10'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                      aria-label="Like comment"
                    >
                      <Heart
                        className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`}
                      />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Footer */}
        <form
          onSubmit={handleSubmit}
          className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Add an interactive comment..."
            className="flex-1 bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 text-slate-950 rounded-xl transition-colors cursor-pointer"
            aria-label="Post comment"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
};
