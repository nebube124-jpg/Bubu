import React, { useState } from 'react';
import { X, Sparkles, Heart, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VideoItem, TipGift } from '../types';
import { TIP_GIFTS } from '../data/seedData';
import { soundEffects } from '../utils/audio';

interface TipModalProps {
  video: VideoItem;
  isOpen: boolean;
  onClose: () => void;
  onSendTip: (amount: number, giftName: string, message: string) => void;
}

export const TipModal: React.FC<TipModalProps> = ({
  video,
  isOpen,
  onClose,
  onSendTip,
}) => {
  const [selectedGift, setSelectedGift] = useState<TipGift>(TIP_GIFTS[2]); // Default to Super Star ($5)
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('Love your content! Keep creating 🔥');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentAmount = isCustom ? parseFloat(customAmount) || 0 : selectedGift.amount;

  const handleSend = () => {
    if (currentAmount <= 0) return;
    setIsSubmitting(true);

    // Audio feedback
    if (currentAmount >= 15) {
      soundEffects.playSuperFanfare();
    } else {
      soundEffects.playCoinChime();
    }

    // Confetti celebration
    confetti({
      particleCount: currentAmount >= 25 ? 120 : 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ec4899', '#38bdf8', '#10b981'],
    });

    onSendTip(
      currentAmount,
      isCustom ? 'Custom Tip' : selectedGift.name,
      message.trim() || 'Awesome video!'
    );

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={video.creator.avatarUrl}
              alt={video.creator.name}
              className="w-10 h-10 rounded-full object-cover border border-amber-400/40"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                Send Creator Tip to {video.creator.name}
              </h3>
              <p className="text-xs text-slate-400">{video.creator.handle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Goal notice if applicable */}
        {video.tipGoal && (
          <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">{video.tipGoal.label}</span>
              <span className="font-mono tabular-nums text-amber-400 font-semibold">
                ${video.tipGoal.current} / ${video.tipGoal.target}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (video.tipGoal.current / video.tipGoal.target) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Gift Selection Grid */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2.5">
              Select Virtual Gift or Tip
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {TIP_GIFTS.map((gift) => {
                const isSelected = !isCustom && selectedGift.id === gift.id;
                return (
                  <button
                    key={gift.id}
                    type="button"
                    onClick={() => {
                      setSelectedGift(gift);
                      setIsCustom(false);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/10 shadow-sm shadow-amber-400/10'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-2xl">{gift.icon}</span>
                    <span className="text-xs font-semibold text-slate-200">{gift.name}</span>
                    <span className="text-xs font-bold font-mono tabular-nums text-amber-400">
                      ${gift.amount.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Amount option */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-slate-400">Or custom amount ($USD):</label>
              {isCustom && (
                <button
                  onClick={() => setIsCustom(false)}
                  className="text-xs text-amber-400 hover:underline cursor-pointer"
                >
                  Use preset gift
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
              <input
                type="number"
                min="0.50"
                step="0.50"
                placeholder="Enter custom tip (e.g. 10.00)"
                value={customAmount}
                onFocus={() => setIsCustom(true)}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setIsCustom(true);
                }}
                className={`w-full bg-slate-950 border pl-7 pr-3 py-2 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                  isCustom ? 'border-amber-400' : 'border-slate-800 focus:border-slate-600'
                }`}
              />
            </div>
          </div>

          {/* Supportive Note */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">
              Supportive note (pinned on comment feed):
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave an encouraging note..."
              maxLength={120}
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Send CTA */}
          <button
            type="button"
            onClick={handleSend}
            disabled={currentAmount <= 0 || isSubmitting}
            className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Send ${currentAmount.toFixed(2)} Instant Tip</span>
          </button>

          <p className="text-[11px] text-center text-slate-500">
            100% of viewer tips go directly to the creator's wallet balance.
          </p>
        </div>
      </div>
    </div>
  );
};
