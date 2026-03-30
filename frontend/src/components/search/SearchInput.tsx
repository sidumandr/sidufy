import { useCallback, useEffect, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { useMusicStore } from "../../store/useMusicStore";

const DEBOUNCE_MS = 380;

export function SearchInput() {
  const [value, setValue] = useState("");
  const searchTracks = useMusicStore((s) => s.searchTracks);
  const isSearching = useMusicStore((s) => s.isSearching);

  const runSearch = useCallback(
    (q: string) => {
      void searchTracks(q);
    },
    [searchTracks],
  );

  useEffect(() => {
    const t = window.setTimeout(() => {
      runSearch(value);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [value, runSearch]);

  return (
    <div className="relative w-full max-w-xl">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
        strokeWidth={2}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Şarkı veya sanatçı ara…"
        autoComplete="off"
        className="glass-noise w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-white/35 backdrop-blur-md focus:border-purple-400/35 focus:outline-none focus:ring-1 focus:ring-purple-500/25"
        aria-label="Müzik ara"
      />
      {isSearching ? (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-purple-300/90" />
      ) : value ? (
        <button
          type="button"
          title="Temizle"
          onClick={() => setValue("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
