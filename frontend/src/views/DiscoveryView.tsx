import { useMusicStore, type Track } from "../store/useMusicStore";
import { SearchInput } from "../components/search/SearchInput";
import { GlassCard } from "../components/UI/GlassCard";
import { TrackCard } from "../components/tracks/TrackCard";

interface DiscoveryViewProps {
  onTrackPlay?: () => void;
}

export function DiscoveryView({ onTrackPlay }: DiscoveryViewProps) {
  const discoveryTracks = useMusicStore((s) => s.discoveryTracks);
  const searchResults = useMusicStore((s) => s.searchResults);
  const searchQuery = useMusicStore((s) => s.searchQuery);
  const setCurrentTrack = useMusicStore((s) => s.setCurrentTrack);
  const setPlaying = useMusicStore((s) => s.setPlaying);
  const currentTrack = useMusicStore((s) => s.currentTrack);

  const showSearch = searchQuery.trim().length > 0;
  const gridTracks = showSearch ? searchResults : discoveryTracks;

  const handlePick = (track: Track) => {
    setCurrentTrack(track);
    setPlaying(true);
    onTrackPlay?.();
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-6">
      <header className="flex flex-col gap-6 sm:items-center sm:text-center">
        <div className="w-full">
          <div className="mb-1 flex items-center justify-center gap-2 text-purple-300/90">
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              Keşfet
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white md:text-4xl text-center">
            {showSearch
              ? `“${searchQuery}” sonuçları`
              : "Senin için seçilenler"}
          </h1>
          <p className="mt-2 mx-auto max-w-lg text-sm text-white/45 text-center">
            Lofi & chillout keşif ızgarası. Aşağıdan ara veya bir karta tıkla.
          </p>
        </div>

        <div className="w-full max-w-md mx-auto px-4">
          <SearchInput />
        </div>
      </header>

      {gridTracks.length === 0 ? (
        <GlassCard className="glass-noise flex flex-1 items-center justify-center p-12 text-center text-white/50">
          {showSearch
            ? "Sonuç bulunamadı veya aranıyor…"
            : "Henüz keşif verisi yok. Birazdan tekrar dene veya ana sayfadan oynatıcıyı yenile."}
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {gridTracks.map((track) => (
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
