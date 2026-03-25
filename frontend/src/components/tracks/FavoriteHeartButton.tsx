import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useMusicStore, type Track } from "../../store/useMusicStore";

interface FavoriteHeartButtonProps {
  track: Track;
  className?: string;
  size?: "sm" | "md";
}

export function FavoriteHeartButton({
  track,
  className = "",
  size = "md",
}: FavoriteHeartButtonProps) {
  const isAuthenticated = useMusicStore((s) => s.isAuthenticated);
  const favorites = useMusicStore((s) => s.favorites);
  const toggleFavorite = useMusicStore((s) => s.toggleFavorite);

  const fromStore = favorites.includes(track.id);
  const [pending, setPending] = useState<"add" | "remove" | null>(null);

  const isFavorite =
    pending === "add" ? true : pending === "remove" ? false : fromStore;

  useEffect(() => {
    setPending(null);
  }, [track.id]);

  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const btnClass = size === "sm" ? "h-8 w-8" : "h-9 w-9";

  return (
    <button
      type="button"
      title={
        !isAuthenticated
          ? "Favoriler için giriş yap"
          : isFavorite
            ? "Favorilerden çıkar"
            : "Favorilere ekle"
      }
      disabled={!isAuthenticated}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) return;
        const was = favorites.includes(track.id);
        setPending(was ? "remove" : "add");
        await toggleFavorite(track);
        setPending(null);
      }}
      className={`pointer-events-auto flex ${btnClass} shrink-0 items-center justify-center rounded-full border backdrop-blur-md transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
        isFavorite
          ? "border-violet-500/50 bg-violet-500/15 text-violet-500 shadow-md shadow-violet-900/20"
          : "glass-noise border-white/15 text-white/55 shadow-md shadow-purple-900/25 hover:border-violet-400/35 hover:text-violet-200/90"
      } ${className}`}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
    >
      <Heart
        className={`${iconClass} transition-colors ${
          isFavorite ? "fill-violet-500 text-violet-500" : "fill-transparent"
        }`}
        strokeWidth={isFavorite ? 2 : 1.75}
      />
    </button>
  );
}
