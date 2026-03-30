import { useEffect, useState } from "react";
import { ChevronRight, ListMusic, Plus } from "lucide-react";
import type { AppTab } from "../layout/AppNav";
import { useMusicStore } from "../../store/useMusicStore";
import { GlassCard } from "../UI/GlassCard";
import { CreatePlaylistModal } from "./CreatePlaylistModal";

interface SidebarPlaylistsProps {
  onNavigateTab?: (tab: AppTab) => void;
}

export function SidebarPlaylists({ onNavigateTab }: SidebarPlaylistsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const isAuthenticated = useMusicStore((s) => s.isAuthenticated);
  const userPlaylists = useMusicStore((s) => s.userPlaylists);
  const fetchUserPlaylists = useMusicStore((s) => s.fetchUserPlaylists);

  useEffect(() => {
    if (isAuthenticated) void fetchUserPlaylists();
  }, [isAuthenticated, fetchUserPlaylists]);

  if (!isAuthenticated) {
    return (
      <GlassCard className="border-white/8 p-3 text-[11px] text-white/35">
        Listelerin için giriş yap.
      </GlassCard>
    );
  }

  const sorted = [...userPlaylists].sort((a, b) => {
    if (a.is_favorite_sidebar && !b.is_favorite_sidebar) return -1;
    if (!a.is_favorite_sidebar && b.is_favorite_sidebar) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <GlassCard className="flex min-h-0 flex-col overflow-hidden border-white/10 p-0">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/75">
            <ListMusic className="h-3.5 w-3.5 text-purple-300/90" />
            Listelerim
          </div>
          <button
            type="button"
            title="Playlist oluştur"
            onClick={() => setModalOpen(true)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-purple-400/25 bg-purple-500/10 text-purple-200 transition-colors hover:bg-purple-500/20"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="max-h-40 space-y-0.5 overflow-y-auto px-1 py-1">
          {sorted.length === 0 ? (
            <p className="px-2 py-2 text-[10px] leading-snug text-white/35">
              Henüz liste yok. + ile oluştur veya Kitaplık sekmesine git.
            </p>
          ) : (
            sorted.map((pl) => (
              <button
                key={pl.id}
                type="button"
                onClick={() => onNavigateTab?.("library")}
                className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <span className="min-w-0 flex-1 truncate">{pl.name}</span>
                {typeof pl.track_count === "number" ? (
                  <span className="shrink-0 text-[9px] text-white/35">
                    {pl.track_count}
                  </span>
                ) : null}
                <ChevronRight className="h-3 w-3 shrink-0 text-white/25" />
              </button>
            ))
          )}
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab?.("library")}
          className="border-t border-white/10 px-3 py-2 text-[10px] font-medium text-purple-300/80 transition-colors hover:bg-white/[0.04] hover:text-purple-200"
        >
          Kitaplığı aç
        </button>
      </GlassCard>

      <CreatePlaylistModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
