import { useEffect, useRef, useState } from "react";
import { ListPlus, Loader2 } from "lucide-react";
import { useMusicStore, type Track } from "../../store/useMusicStore";

interface AddToPlaylistMenuProps {
  track: Track;
  className?: string;
}

export function AddToPlaylistMenu({
  track,
  className = "",
}: AddToPlaylistMenuProps) {
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = useMusicStore((s) => s.isAuthenticated);
  const userPlaylists = useMusicStore((s) => s.userPlaylists);
  const addTrackToPlaylist = useMusicStore((s) => s.addTrackToPlaylist);
  const fetchUserPlaylists = useMusicStore((s) => s.fetchUserPlaylists);

  const addable = userPlaylists.filter((p) => !p.is_favorite_sidebar);

  useEffect(() => {
    if (!open) return;
    void fetchUserPlaylists();
  }, [open, fetchUserPlaylists]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc, true);
    return () => document.removeEventListener("mousedown", onDoc, true);
  }, [open]);

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        title="Listeye eklemek için giriş yap"
        disabled
        className={`pointer-events-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/30 backdrop-blur-md ${className}`}
      >
        <ListPlus className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className={`relative isolate ${className}`} ref={wrapRef}>
      <button
        type="button"
        title="Listeye ekle"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="pointer-events-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-white/75 shadow-sm shadow-purple-950/30 backdrop-blur-md transition-all hover:border-violet-400/30 hover:text-violet-100 active:scale-95"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <ListPlus className="h-4 w-4" />
      </button>

      {open ? (
        <div
          className="pointer-events-auto absolute left-0 top-full z-[70] mt-2 min-w-[10.5rem] max-w-[16rem] overflow-hidden rounded-lg border border-white/10 bg-[#0d0a14]/80 py-0.5 shadow-lg shadow-purple-950/40 backdrop-blur-xl"
          role="menu"
        >
          <div className="px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest text-white/35">
            Listeye ekle
          </div>
          {addable.length === 0 ? (
            <p className="px-2.5 pb-2 pt-0.5 text-center text-[10px] font-normal leading-relaxed text-white/38">
              Liste yok.
            </p>
          ) : (
            <ul className="max-h-[14rem] overflow-y-auto py-0.5">
              {addable.map((pl) => (
                <li key={pl.id}>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={busyId === pl.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setBusyId(pl.id);
                      void (async () => {
                        await addTrackToPlaylist(pl.id, track);
                        setBusyId(null);
                        setOpen(false);
                      })();
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs text-white/80 transition-colors hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
                  >
                    {busyId === pl.id ? (
                      <Loader2 className="h-3 w-3 shrink-0 animate-spin text-violet-400" />
                    ) : null}
                    <span className="min-w-0 flex-1 truncate">{pl.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
