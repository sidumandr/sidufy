import { Pause, Play } from "lucide-react";
import { AddToPlaylistMenu } from "../tracks/AddToPlaylistMenu";
import { FavoriteHeartButton } from "../tracks/FavoriteHeartButton";
import { useMusicStore } from "../../store/useMusicStore";

interface TrackItemProps {
  trackId: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function TrackItem({ trackId, isSelected, onSelect }: TrackItemProps) {
  const { queue, currentTrack, isPlaying, setPlaying, setCurrentTrack } =
    useMusicStore();
  const track = queue.find((item) => item.id === trackId);

  if (!track) return null;

  const isPlayingTrack = currentTrack?.id === track.id;

  return (
    <div
      onClick={() => onSelect(track.id)}
      onDoubleClick={() => {
        setPlaying(true);
        setCurrentTrack(track);
      }}
      className={`group relative flex items-center gap-4 rounded-2xl p-3 transition-all duration-500 ${isSelected ? "bg-purple-500/15 ring-1 ring-purple-500/30" : "hover:bg-white/5"}`}
    >
      <img
        src={track.cover}
        alt={track.title}
        className="h-12 w-12 rounded-xl object-cover shadow-lg"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`truncate text-sm font-bold ${isSelected ? "text-purple-300" : "text-white/90"}`}
          >
            {track.title}
          </p>
          {isPlayingTrack && isPlaying && (
            <span className="animate-pulse text-[10px] font-bold text-purple-400">
              Pulse
            </span>
          )}
        </div>
        <p className="text-xs text-white/40">{track.artist}</p>
      </div>

      <div
        className="flex shrink-0 items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <FavoriteHeartButton track={track} size="sm" />
        <AddToPlaylistMenu track={track} />
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          if (isPlayingTrack) {
            setPlaying(!isPlaying);
          } else {
            setCurrentTrack(track);
            setPlaying(true);
          }
        }}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all ${
          isPlayingTrack && isPlaying
            ? "border-purple-400 bg-purple-500/20 text-white"
            : "border-white/10 text-white/40 group-hover:border-white/40 group-hover:text-white"
        }`}
      >
        {isPlayingTrack && isPlaying ? (
          <Pause size={14} />
        ) : (
          <Play size={14} className="translate-x-0" />
        )}
      </button>
    </div>
  );
}
