import { useMemo } from "react";
import {
  Disc3,
  Focus,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { useMusicStore } from "../../store/useMusicStore";
import { FavoriteHeartButton } from "../tracks/FavoriteHeartButton";
import { GlassCard } from "../UI/GlassCard";
import { Equalizer } from "../UI/Equalizer";

interface MainPlayerProps {
  focusMode: boolean;
  onToggleFocus: () => void;
  progress: number;
  onSeek: (time: number) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function MainPlayer({
  focusMode,
  onToggleFocus,
  progress,
  onSeek,
}: MainPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    setPlaying,
    nextTrack,
    prevTrack,
    volume,
    setVolume,
  } = useMusicStore();

  const progressPercent = useMemo(() => {
    if (!currentTrack?.duration) return 0;
    return (progress / currentTrack.duration) * 100;
  }, [currentTrack?.duration, progress]);

  if (!currentTrack) return null;

  return (
    <div
      className={`flex w-full flex-col items-center justify-center transition-all duration-700 ${focusMode ? "max-w-lg" : ""}`}
    >
      <GlassCard className="w-full max-w-md p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Disc3 className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium opacity-70">Now Playing</span>
            <FavoriteHeartButton track={currentTrack} size="sm" />
          </div>
          <button
            type="button"
            onClick={onToggleFocus}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-all ${focusMode ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
          >
            <Focus className="h-3.5 w-3.5" /> Focus
          </button>
        </div>

        <div className="relative mx-auto mb-6 aspect-square w-full max-w-xs overflow-hidden rounded-2xl shadow-2xl shadow-purple-500/20">
          <img
            src={currentTrack.cover}
            alt={currentTrack.title}
            className="h-full w-full object-cover transition-transform duration-700"
            style={{ transform: isPlaying ? "scale(1.05)" : "scale(1)" }}
          />
          <div className="absolute bottom-4 right-4">
            <Equalizer isPlaying={isPlaying} />
          </div>
        </div>

        <div className="mb-4 text-center">
          <h2 className="text-xl font-semibold text-white">
            {currentTrack.title}
          </h2>
          <p className="text-sm text-white/50">{currentTrack.artist}</p>
        </div>

        <div className="mb-6">
          <input
            type="range"
            min="0"
            max={currentTrack.duration || 100}
            value={progress}
            onChange={(event) => onSeek(Number(event.target.value))}
            style={{
              background: `linear-gradient(to right, #c084fc 0%, #c084fc ${progressPercent}%, rgba(255,255,255,0.1) ${progressPercent}%, rgba(255,255,255,0.1) 100%)`,
            }}
            className="h-1 w-full appearance-none rounded-full"
          />
          <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-center gap-6">
          <button
            onClick={prevTrack}
            className="text-white/60 transition-colors hover:text-white"
          >
            <SkipBack />
          </button>
          <button
            onClick={() => setPlaying(!isPlaying)}
            className="glass-noise group flex h-20 w-20 items-center justify-center rounded-full border border-white/20 shadow-2xl transition-all hover:scale-110 active:scale-95"
          >
            {isPlaying ? (
              <Pause size={32} className="text-white" fill="white" />
            ) : (
              <Play
                size={32}
                className="translate-x-0.5 text-white"
                fill="white"
              />
            )}
          </button>
          <button
            onClick={nextTrack}
            className="text-white/60 transition-colors hover:text-white"
          >
            <SkipForward />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <Volume2 size={12} className="text-white/40" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            style={{
              background: `linear-gradient(to right, #c084fc 0%, #c084fc ${volume}%, rgba(255,255,255,0.1) ${volume}%, rgba(255,255,255,0.1) 100%)`,
            }}
            className="h-1 w-[80px] appearance-none rounded-full"
          />
        </div>
      </GlassCard>
    </div>
  );
}
