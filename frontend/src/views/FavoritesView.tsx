import { Heart } from "lucide-react";
import { useEffect } from "react";
import { useMusicStore, type Track } from "../store/useMusicStore";
import { GlassCard } from "../components/UI/GlassCard";
import { TrackCard } from "../components/tracks/TrackCard";

interface FavoritesViewProps {
  onTrackPlay?: () => void;
}

export function FavoritesView({ onTrackPlay }: FavoritesViewProps) {
  const isAuthenticated = useMusicStore((s) => s.isAuthenticated);
  const favoriteTracks = useMusicStore((s) => s.favoriteTracks);
  const favoriteTracksLoading = useMusicStore((s) => s.favoriteTracksLoading);
  const favorites = useMusicStore((s) => s.favorites);
  const fetchFavoriteTracks = useMusicStore((s) => s.fetchFavoriteTracks);
  const fetchFavorites = useMusicStore((s) => s.fetchFavorites);
  const setCurrentTrack = useMusicStore((s) => s.setCurrentTrack);
  const setPlaying = useMusicStore((s) => s.setPlaying);
  const currentTrack = useMusicStore((s) => s.currentTrack);

  useEffect(() => {
    if (!isAuthenticated) return;
    void (async () => {
      await fetchFavorites();
      await fetchFavoriteTracks();
    })();
  }, [isAuthenticated, fetchFavorites, fetchFavoriteTracks]);

  const handlePick = (track: Track) => {
    setCurrentTrack(track);
    setPlaying(true);
    onTrackPlay?.();
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-purple-300/90">
            <Heart className="h-4 w-4 fill-purple-400/40 text-purple-300" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              Favoriler
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">
            Beğendiğin parçalar
          </h1>
          <p className="mt-1 max-w-xl text-sm text-white/45">
            Sunucudaki favori ID’lerin Jamendo ile eşlenir; giriş yapmadan bu
            liste yüklenmez.
          </p>
        </div>
      </header>

      {!isAuthenticated ? (
        <GlassCard className="glass-noise border-white/10 p-10 text-center text-sm text-white/45">
          Favorilerini görmek için soldan giriş yap.
        </GlassCard>
      ) : favoriteTracksLoading ? (
        <GlassCard className="glass-noise flex flex-1 items-center justify-center p-16 text-center text-white/45">
          Favoriler yükleniyor…
        </GlassCard>
      ) : favorites.length === 0 ? (
        <GlassCard className="glass-noise flex flex-1 flex-col items-center justify-center gap-2 p-12 text-center text-white/45">
          <p>Henüz favori yok.</p>
          <p className="text-xs text-white/35">
            Keşfet veya oynatıcıda kalbe tıklayarak ekleyebilirsin.
          </p>
        </GlassCard>
      ) : favoriteTracks.length === 0 ? (
        <GlassCard className="glass-noise flex flex-1 flex-col items-center justify-center gap-2 p-12 text-center text-white/45">
          <p>
            {favorites.length} favori kaydı var ancak Jamendo’da eşleşen parça
            bulunamadı.
          </p>
          <p className="text-xs text-white/35">
            Eski veya geçersiz ID’ler listede görünmez.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {favoriteTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              active={currentTrack?.id === track.id}
              onPlay={handlePick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
