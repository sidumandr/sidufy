import { useEffect, useState } from "react";
import { Music2, Pause, Play, SkipForward } from "lucide-react";
import { useMusicStore } from "../../store/useMusicStore";

export function MiniPlayer() {
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const setPlaying = useMusicStore((s) => s.setPlaying);
  const nextTrack = useMusicStore((s) => s.nextTrack);

  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setEntered(false);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none transition-all duration-500 ease-out motion-reduce:transition-none ${
        entered
          ? "translate-x-0 translate-y-0 opacity-100"
          : "translate-x-6 -translate-y-2 opacity-0"
      }`}
    >
      <div className="glass-noise pointer-events-auto rounded-2xl border border-purple-400/20 bg-[#0d0a14]/65 shadow-xl shadow-purple-900/45 backdrop-blur-xl transition-[box-shadow,transform] duration-300 hover:shadow-purple-500/25">
        {!currentTrack ? (
          <div className="flex items-center gap-2 px-3 py-2.5 text-xs text-white/40">
            <Music2 className="h-4 w-4 shrink-0 text-purple-400/70" />
            <span>Parça seçilmedi</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-2.5 pr-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-md shadow-purple-900/30">
              <img
                src={currentTrack.cover}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight text-white">
                {currentTrack.title}
              </p>
              <p className="truncate text-[11px] text-white/45">
                {currentTrack.artist}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => setPlaying(!isPlaying)}
                className="glass-noise flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition-transform hover:scale-105 active:scale-95"
                aria-label={isPlaying ? "Duraklat" : "Oynat"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" fill="currentColor" />
                ) : (
                  <Play
                    className="h-4 w-4 translate-x-px"
                    fill="currentColor"
                  />
                )}
              </button>
              <button
                type="button"
                onClick={nextTrack}
                className="rounded-full p-2 text-white/55 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Sonraki"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
