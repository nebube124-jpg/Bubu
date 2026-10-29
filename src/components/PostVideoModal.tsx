import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Video,
  Sparkles,
  DollarSign,
  Music,
  Check,
  Disc,
  Play,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VideoItem, BountyChallenge } from '../types';
import { BOUNTY_CHALLENGES, CURRENT_USER } from '../data/seedData';
import { soundEffects } from '../utils/audio';

interface PostVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishVideo: (video: VideoItem) => void;
  initialBountyId?: string;
}

export const PostVideoModal: React.FC<PostVideoModalProps> = ({
  isOpen,
  onClose,
  onPublishVideo,
  initialBountyId,
}) => {
  const [tab, setTab] = useState<'upload' | 'record'>('upload');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('#CreatorEconomy #VidPulse');
  const [soundTitle, setSoundTitle] = useState('Original Sound - Alex Rivera');
  const [enableTips, setEnableTips] = useState(true);
  const [tipGoalLabel, setTipGoalLabel] = useState('New Camera Lens Upgrade');
  const [tipGoalAmount, setTipGoalAmount] = useState('300');
  const [selectedBountyId, setSelectedBountyId] = useState<string>(initialBountyId || '');
  const [filterStyle, setFilterStyle] = useState<'normal' | 'vibrant' | 'warm' | 'noir' | 'cyberpunk'>('normal');

  // Video media state
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>('');
  const [uploadedThumbnailUrl, setUploadedThumbnailUrl] = useState<string>(
    '/src/assets/images/creator_bounty_banner_1793316963353.jpg'
  );
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (initialBountyId) {
      setSelectedBountyId(initialBountyId);
      const b = BOUNTY_CHALLENGES.find((item) => item.id === initialBountyId);
      if (b && !tagsInput.includes(b.tag)) {
        setTagsInput((prev) => `${prev} ${b.tag}`);
      }
    }
  }, [initialBountyId]);

  // Clean up camera stream when modal closes
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Switch to camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Camera access denied or unavailable.';
      setCameraError(errorMsg);
    }
  };

  const handleStartRecording = () => {
    if (!streamRef.current) return;
    setRecordedChunks([]);
    setRecordSeconds(0);
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };

    mediaRecorder.onstop = () => {
      // Create blob url
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setUploadedVideoUrl(url);
    };

    mediaRecorder.start();
    setIsRecording(true);

    timerRef.current = window.setInterval(() => {
      setRecordSeconds((s) => {
        if (s >= 30) {
          handleStopRecording();
          return 30;
        }
        return s + 1;
      });
    }, 1000);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopCameraStream();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setUploadedVideoUrl(url);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  // Sample templates for quick testing
  const applyPreset = (presetType: 'tech' | 'travel') => {
    if (presetType === 'tech') {
      setTitle('Future workstation setup showcase for the #FutureTech2026 bounty!');
      setDescription('Dual display, ambient color glow, high efficiency workflow rig.');
      setTagsInput('#FutureTech2026 #DeskSetup #CreatorTech');
      setUploadedThumbnailUrl('/src/assets/images/video_thumb_gadgets_1793316963327.jpg');
      setUploadedVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
      setSelectedBountyId('bounty_tech_2026');
      setFilterStyle('cyberpunk');
    } else {
      setTitle('Breathtaking alpine sunset view from the summit peak 🌄');
      setDescription('Shot with anamorphic glass on an early morning ridge run.');
      setTagsInput('#WanderLustVibe #Landscape #Cinematic #Drone');
      setUploadedThumbnailUrl('/src/assets/images/video_thumb_travel_1793316964159.jpg');
      setUploadedVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4');
      setSelectedBountyId('bounty_wanderlust');
      setFilterStyle('vibrant');
    }
  };

  // AI Viral title & tag generator
  const handleAIAssist = () => {
    const suggestions = [
      {
        t: 'How I turned 30-sec clips into $2,400 monthly creator earnings 💸',
        tags: '#CreatorEconomy #PassiveIncome #GetPaid #Tips',
      },
      {
        t: 'The secret gear every video creator needs before 2027 🎥⚡',
        tags: '#VideoProduction #CreatorGear #FutureTech #Filmmaking',
      },
      {
        t: 'Testing the $5,000 bounty challenge rules in 20 seconds! 🔥',
        tags: '#BountyChallenge #CreatorFund #ViralVids #TechHacks',
      },
    ];
    const pick = suggestions[Math.floor(Math.random() * suggestions.length)];
    setTitle(pick.t);
    setTagsInput(pick.tags);
    soundEffects.playCoinChime();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const chosenBounty = BOUNTY_CHALLENGES.find((b) => b.id === selectedBountyId);
    const parsedTags = tagsInput
      .split(/\s+/)
      .map((t) => (t.startsWith('#') ? t : `#${t}`))
      .filter((t) => t.length > 1);

    const newVideo: VideoItem = {
      id: `user_vid_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Posted on VidPulse.',
      creator: CURRENT_USER,
      videoUrl:
        uploadedVideoUrl ||
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: uploadedThumbnailUrl,
      duration: recordSeconds > 0 ? recordSeconds : 24,
      views: 1,
      likes: 0,
      tipsAmount: 0,
      commentsCount: 0,
      sharesCount: 0,
      tags: parsedTags.length > 0 ? parsedTags : ['#VidPulse', '#CreatorEconomy'],
      soundTitle,
      createdAt: 'Just now',
      filterStyle,
      bountyId: chosenBounty?.id,
      bountyTag: chosenBounty?.tag,
      tipGoal: enableTips
        ? {
            label: tipGoalLabel || 'Creator Gear Fund',
            target: parseFloat(tipGoalAmount) || 200,
            current: 0,
          }
        : undefined,
    };

    soundEffects.playCashoutDing();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });

    onPublishVideo(newVideo);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Creator Studio · Post & Monetize Video
            </h3>
          </div>
          <button
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Top Mode Segmented Switch (§1.A: clean button tabs) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setTab('upload');
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  tab === 'upload'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Video</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('record');
                  startCamera();
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  tab === 'record'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Record with Camera</span>
              </button>
            </div>

            {/* Quick Sample Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 hidden sm:inline">Quick template:</span>
              <button
                type="button"
                onClick={() => applyPreset('tech')}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors cursor-pointer"
              >
                Tech Setup
              </button>
              <button
                type="button"
                onClick={() => applyPreset('travel')}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 transition-colors cursor-pointer"
              >
                Travel Reveal
              </button>
            </div>
          </div>

          {/* Media Capture Area */}
          {tab === 'upload' ? (
            <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-6 text-center bg-slate-950/40 relative">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-amber-400">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  {uploadedVideoUrl
                    ? 'Video selected! Click to change file'
                    : 'Drop vertical video (MP4/WebM) or click to browse'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Recommended format: 9:16 vertical, up to 1080x1920
                </p>
                {uploadedVideoUrl && (
                  <div className="pt-2">
                    <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Video ready to monetize
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-black rounded-2xl overflow-hidden border border-slate-800 relative flex flex-col items-center justify-center aspect-[9/10] max-h-[300px]">
              {cameraError ? (
                <div className="p-4 text-center text-xs text-rose-400">
                  {cameraError}
                  <button
                    type="button"
                    onClick={startCamera}
                    className="block mx-auto mt-2 text-amber-400 underline cursor-pointer"
                  >
                    Retry Camera
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoPreviewRef}
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${
                      filterStyle === 'cyberpunk'
                        ? 'contrast-125 saturate-150 hue-rotate-15'
                        : filterStyle === 'vibrant'
                        ? 'contrast-110 saturate-125'
                        : filterStyle === 'warm'
                        ? 'sepia-25 saturate-125'
                        : filterStyle === 'noir'
                        ? 'grayscale contrast-125'
                        : ''
                    }`}
                  />
                  {/* Recording status overlay */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono text-white flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isRecording ? 'bg-rose-500 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                    <span>{recordSeconds}s / 30s</span>
                  </div>

                  {/* Record Controls Bar */}
                  <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-500/20 cursor-pointer"
                      >
                        <Disc className="w-4 h-4 animate-spin" />
                        <span>Start Record</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="px-4 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Done (Save Clip)</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Visual Camera Filter Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Visual Color Grade & Filter
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['normal', 'vibrant', 'warm', 'cyberpunk', 'noir'] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setFilterStyle(style)}
                  className={`py-1.5 text-xs font-semibold capitalize rounded-lg border transition-all cursor-pointer ${
                    filterStyle === style
                      ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Video Metadata Inputs */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Video Title / Hook
                </label>
                <button
                  type="button"
                  onClick={handleAIAssist}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Viral Hook Suggest</span>
                </button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My desk setup for 2026 or Banff sunrise hike ⚡"
                required
                className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Description & Story
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share the backstory, camera settings, or tips..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Hashtags (space separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Sound Track
                </label>
                <input
                  type="text"
                  value={soundTitle}
                  onChange={(e) => setSoundTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* MONETIZATION SUITE ("Get Paid") */}
          <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Monetization & Creator Earnings Settings
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Enable viewers to tip directly and submit to sponsored cash bounties.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableTips}
                  onChange={(e) => setEnableTips(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400" />
              </label>
            </div>

            {enableTips && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    Tip Goal Label (e.g. Gear Fund)
                  </label>
                  <input
                    type="text"
                    value={tipGoalLabel}
                    onChange={(e) => setTipGoalLabel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    Goal Amount ($USD)
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={tipGoalAmount}
                    onChange={(e) => setTipGoalAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* Sponsored Bounty Association */}
            <div className="pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Submit into Sponsored Cash Bounty (Optional)
              </label>
              <select
                value={selectedBountyId}
                onChange={(e) => {
                  setSelectedBountyId(e.target.value);
                  const b = BOUNTY_CHALLENGES.find((item) => item.id === e.target.value);
                  if (b && !tagsInput.includes(b.tag)) {
                    setTagsInput((prev) => `${prev} ${b.tag}`);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">No bounty challenge (Standard creator post)</option>
                {BOUNTY_CHALLENGES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} — ${b.rewardPool.toLocaleString()} Prize Pool ({b.tag})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit CTA Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!title.trim()}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Publish Video & Activate Monetization</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
