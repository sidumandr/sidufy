import type { Track } from "../../store/useMusicStore";
import { GlassCard } from "../UI/GlassCard";
import { AddToPlaylistMenu } from "./AddToPlaylistMenu";
import { FavoriteHeartButton } from "./FavoriteHeartButton";

interface TrackCardProps {
  track: Track;
  active: boolean;
  onPlay: (track: Track) => void;
}

export function TrackCard({ track, active, onPlay }: TrackCardProps) {
  return (
    <div
      className={`group relative transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] ${
        active
          ? "rounded-2xl ring-2 ring-purple-400/50 ring-offset-2 ring-offset-[#0d0a14]"
          : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onPlay(track)}
        className="block w-full text-left"
      >
        <GlassCard
          className={`glass-noise overflow-hidden p-0 transition-all duration-500 ${
            active
              ? "border-purple-400/35 bg-purple-500/10"
              : "border-white/10 group-hover:border-white/20"
          }`}
        >
          <div className="relative aspect-square overflow-hidden">
            <img
              src={track.cover}
              alt={track.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a14]/90 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-0 left-0 right-0 p-3 pr-2">
              <p className="truncate text-sm font-bold text-white drop-shadow-md">
                {track.title}
              </p>
              <p className="truncate text-xs text-white/55">{track.artist}</p>
            </div>
          </div>
        </GlassCard>
      </button>

      <div className="pointer-events-none absolute right-2 top-2 z-10 flex gap-1">
        <FavoriteHeartButton track={track} size="sm" />
        <AddToPlaylistMenu track={track} />
      </div>
    </div>
  );
}
