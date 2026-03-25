import { Sparkles } from "lucide-react";
import { useMusicStore, type Track } from "../store/useMusicStore";
import { GlassCard } from "../components/UI/GlassCard";
import { TrackCard } from "../components/tracks/TrackCard";

interface DiscoveryViewProps {
  onTrackPlay?: () => void;
}

export function DiscoveryView({ onTrackPlay }: DiscoveryViewProps) {
  const discoveryTracks = useMusicStore((s) => s.discoveryTracks);
  const setCurrentTrack = useMusicStore((s) => s.setCurrentTrack);
  const setPlaying = useMusicStore((s) => s.setPlaying);
  const currentTrack = useMusicStore((s) => s.currentTrack);

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
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              Keşfet
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">
            Senin için seçilenler
          </h1>
          <p className="mt-1 max-w-xl text-sm text-white/45">
            Lofi ve chill akışlarından oluşan keşif ızgarası. Bir karta tıkla,
            çalmaya başlasın.
          </p>
        </div>
      </header>

      {discoveryTracks.length === 0 ? (
        <GlassCard className="glass-noise flex flex-1 items-center justify-center p-12 text-center text-white/50">
          Henüz keşif verisi yok. Birazdan tekrar dene veya ana sayfadan oynatıcıyı
          yenile.
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {discoveryTracks.map((track) => (
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
