import React, { useRef, useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  DollarSign,
  Music,
  Check,
  Sparkles,
} from 'lucide-react';
import { VideoItem } from '../types';
import { soundEffects } from '../utils/audio';

interface VideoCardProps {
  video: VideoItem;
  isActive: boolean;
  onOpenTipModal: () => void;
  onOpenComments: () => void;
  onLikeToggle: (id: string) => void;
  isLiked: boolean;
  onFollowToggle: (creatorId: string) => void;
  isFollowed: boolean;
  onSelectTag?: (tag: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  isActive,
  onOpenTipModal,
  onOpenComments,
  onLikeToggle,
  isLiked,
  onFollowToggle,
  isFollowed,
  onSelectTag,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);

  // Video playback management when active
  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay may need muted
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().catch(() => {});
            }
          });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  // Dynamic canvas animation fallback if video fails or when drawing audio waves
  useEffect(() => {
    if (!videoError && video.videoUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let step = 0;

    const render = () => {
      step += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      // Draw subtle dynamic gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      if (video.filterStyle === 'cyberpunk') {
        grad.addColorStop(0, '#11052C');
        grad.addColorStop(0.5, '#3D087B');
        grad.addColorStop(1, '#0F0E17');
      } else if (video.filterStyle === 'warm') {
        grad.addColorStop(0, '#2D1B00');
        grad.addColorStop(0.5, '#451A03');
        grad.addColorStop(1, '#0B090A');
      } else {
        grad.addColorStop(0, '#0F172A');
        grad.addColorStop(0.5, '#1E293B');
        grad.addColorStop(1, '#020617');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Draw audio reactive wave rings
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const radius = ((step * 40 + i * 80) % (w / 1.5)) + 40;
        const alpha = Math.max(0, 1 - radius / (w / 1.5));
        ctx.strokeStyle = `rgba(250, 204, 21, ${alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [videoError, video.videoUrl, video.filterStyle]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration || video.duration || 1;
    setProgress((current / dur) * 100);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playLikePop();
    onLikeToggle(video.id);

    // Spawn floating heart
    const newHeart = { id: Date.now(), x: Math.random() * 40 - 20 };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1000);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="relative w-full h-[78vh] min-h-[520px] max-h-[720px] max-w-[420px] mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center select-none group">
      {/* Video Element or Animated Fallback */}
      {video.videoUrl && !videoError ? (
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.thumbnailUrl}
          loop
          playsInline
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onError={() => setVideoError(true)}
          onClick={togglePlay}
          className={`w-full h-full object-cover cursor-pointer ${
            video.filterStyle === 'cyberpunk'
              ? 'contrast-125 saturate-150 hue-rotate-15'
              : video.filterStyle === 'vibrant'
              ? 'contrast-110 saturate-125'
              : video.filterStyle === 'warm'
              ? 'sepia-25 saturate-125'
              : video.filterStyle === 'noir'
              ? 'grayscale contrast-125'
              : ''
          }`}
        />
      ) : (
        <div
          onClick={togglePlay}
          className="relative w-full h-full cursor-pointer flex items-center justify-center"
        >
          {video.thumbnailUrl && (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          <canvas
            ref={canvasRef}
            width={420}
            height={720}
            className="absolute inset-0 w-full h-full mix-blend-screen opacity-60"
          />
        </div>
      )}

      {/* Measured Scrim for Media Overlays (§1.F: 4.5:1 legibility) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />

      {/* Floating Hearts Animation */}
      {floatingHearts.map((heart) => (
        <div
          key={heart.id}
          className="pointer-events-none absolute bottom-32 right-12 z-40 animate-out fade-out slide-out-to-top duration-1000"
          style={{ transform: `translateX(${heart.x}px)` }}
        >
          <Heart className="w-8 h-8 fill-rose-500 text-rose-500 drop-shadow-lg" />
        </div>
      ))}

      {/* Center Play/Pause Indicator if paused */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute z-20 w-16 h-16 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer"
          aria-label="Play video"
        >
          <Play className="w-8 h-8 fill-white translate-x-0.5" />
        </button>
      )}

      {/* Top Bar inside Video: Sound Toggle & Bounty badge if present */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
        {video.bountyTag ? (
          <button
            onClick={() => onSelectTag?.(video.bountyTag!)}
            className="text-xs font-semibold text-amber-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-400/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{video.bountyTag}</span>
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={toggleMute}
          className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-colors cursor-pointer"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Right Action Rail (Vertical thumb zone) */}
      <div className="absolute right-3.5 bottom-16 z-20 flex flex-col items-center gap-4.5 pointer-events-auto">
        {/* Creator Avatar with Follow Toggle */}
        <div className="relative mb-1">
          <img
            src={video.creator.avatarUrl}
            alt={video.creator.name}
            className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-lg"
            referrerPolicy="no-referrer"
          />
          <button
            onClick={() => onFollowToggle(video.creator.id)}
            className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow cursor-pointer transition-transform ${
              isFollowed
                ? 'bg-slate-700 text-slate-300'
                : 'bg-rose-500 text-white hover:scale-110'
            }`}
            aria-label={isFollowed ? 'Unfollow' : 'Follow'}
          >
            {isFollowed ? <Check className="w-3 h-3" /> : '+'}
          </button>
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1 cursor-pointer group/btn"
          aria-label="Like video"
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
              isLiked
                ? 'bg-rose-500/20 text-rose-500 scale-105'
                : 'bg-black/40 text-white hover:bg-black/60 group-hover/btn:scale-110'
            }`}
          >
            <Heart
              className={`w-5 h-5 transition-transform ${
                isLiked ? 'fill-rose-500' : ''
              }`}
            />
          </div>
          <span className="text-[11px] font-semibold text-white drop-shadow font-mono tabular-nums">
            {(video.likes + (isLiked ? 1 : 0)).toLocaleString()}
          </span>
        </button>

        {/* Comments Button */}
        <button
          onClick={onOpenComments}
          className="flex flex-col items-center gap-1 cursor-pointer group/btn"
          aria-label="View comments"
        >
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-all group-hover/btn:scale-110">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-white drop-shadow font-mono tabular-nums">
            {video.commentsCount}
          </span>
        </button>

        {/* SEND TIP / CREATOR PAY BUTTON (Hero Feature) */}
        <button
          onClick={onOpenTipModal}
          className="flex flex-col items-center gap-1 cursor-pointer group/tip animate-pulse hover:animate-none"
          aria-label="Send tip to creator"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover/tip:scale-115 transition-transform">
            <DollarSign className="w-6 h-6 stroke-[3]" />
          </div>
          <span className="text-[11px] font-bold text-amber-300 drop-shadow font-mono tabular-nums">
            ${video.tipsAmount.toFixed(0)}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 cursor-pointer group/btn"
          aria-label="Share video"
        >
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-all group-hover/btn:scale-110">
            {copiedShare ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
          </div>
          <span className="text-[11px] font-semibold text-white drop-shadow">
            {copiedShare ? 'Copied' : video.sharesCount}
          </span>
        </button>
      </div>

      {/* Bottom Video Information Overlay */}
      <div className="absolute left-4 right-16 bottom-5 z-20 pointer-events-auto space-y-2">
        {/* Creator Name & Handle */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white drop-shadow hover:underline cursor-pointer">
            {video.creator.name}
          </span>
          <span className="text-xs text-slate-300 drop-shadow">
            {video.creator.handle}
          </span>
        </div>

        {/* Title & Caption */}
        <p className="text-xs text-white drop-shadow font-normal line-clamp-2 leading-relaxed">
          {video.title}
        </p>

        {/* Tags (Unboxed text with separators per §1.A) */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-amber-300/90 font-medium">
          {video.tags.map((t, i) => (
            <React.Fragment key={t}>
              {i > 0 && <span className="text-slate-500">·</span>}
              <button
                onClick={() => onSelectTag?.(t)}
                className="hover:text-amber-200 hover:underline cursor-pointer"
              >
                {t}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Creator Tip Goal Progress Bar */}
        {video.tipGoal && (
          <div className="bg-black/50 backdrop-blur-md p-2 rounded-xl border border-white/10 max-w-[280px]">
            <div className="flex items-center justify-between text-[11px] text-slate-200 mb-1">
              <span className="truncate pr-2 font-medium">{video.tipGoal.label}</span>
              <span className="font-mono tabular-nums text-amber-300 font-bold shrink-0">
                ${video.tipGoal.current} / ${video.tipGoal.target}
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-rose-400 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (video.tipGoal.current / video.tipGoal.target) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Audio Track Marquee */}
        <div className="flex items-center gap-2 text-[11px] text-slate-300 pt-0.5">
          <Music className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="truncate max-w-[220px]">{video.soundTitle}</span>
        </div>
      </div>

      {/* Bottom Progress Bar Scrubber */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
        <div
          className="h-full bg-amber-400 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
