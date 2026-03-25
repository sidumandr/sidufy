import { useEffect, useState } from "react";
import { Heart, ListMusic, Music2, Plus, Trash2 } from "lucide-react";
import { useMusicStore } from "../store/useMusicStore";
import { GlassCard } from "../components/UI/GlassCard";

export function PlaylistView() {
  const userPlaylists = useMusicStore((s) => s.userPlaylists);
  const isAuthenticated = useMusicStore((s) => s.isAuthenticated);
  const fetchUserPlaylists = useMusicStore((s) => s.fetchUserPlaylists);
  const createPlaylist = useMusicStore((s) => s.createPlaylist);
  const deletePlaylist = useMusicStore((s) => s.deletePlaylist);

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    void fetchUserPlaylists();
  }, [fetchUserPlaylists]);

  const sorted = [...userPlaylists].sort((a, b) => {
    if (a.is_favorite_sidebar && !b.is_favorite_sidebar) return -1;
    if (!a.is_favorite_sidebar && b.is_favorite_sidebar) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    const ok = await createPlaylist(name);
    setCreating(false);
    if (ok) setNewName("");
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-6">
      <header>
        <div className="mb-1 flex items-center gap-2 text-purple-300/90">
          <ListMusic className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">
            Kitaplık
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-white md:text-3xl">
          Çalma listelerin
        </h1>
        <p className="mt-1 max-w-xl text-sm text-white/45">
          Favorilerin kalp ile senkron; diğer listeleri burada oluşturup
          şarkılara + menüsünden ekleyebilirsin.
        </p>
      </header>

      {!isAuthenticated ? (
        <GlassCard className="glass-noise border-white/10 p-8 text-center text-sm text-white/45">
          Listelerini görmek ve yönetmek için soldan giriş yap.
        </GlassCard>
      ) : (
        <>
          <GlassCard className="glass-noise border-purple-400/15 p-4 md:p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40">
              Yeni liste
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleCreate();
                }}
                placeholder="Örn. Çalışma müzikleri"
                className="glass-noise min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/30 backdrop-blur-md focus:border-purple-400/40 focus:outline-none"
              />
              <button
                type="button"
                disabled={creating || !newName.trim()}
                onClick={() => void handleCreate()}
                className="glass-noise flex items-center justify-center gap-2 rounded-xl border border-purple-400/30 bg-purple-500/15 px-5 py-2.5 text-sm font-semibold text-purple-100 shadow-lg shadow-purple-900/25 transition-all hover:bg-purple-500/25 disabled:opacity-40"
              >
                {creating ? (
                  <span>Oluşturuluyor…</span>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Oluştur
                  </>
                )}
              </button>
            </div>
          </GlassCard>

          {sorted.length === 0 ? (
            <GlassCard className="glass-noise flex flex-1 items-center justify-center p-12 text-center text-white/50">
              Listelerin yok.
            </GlassCard>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((pl) => (
                <GlassCard
                  key={pl.id}
                  className={`glass-noise flex flex-col gap-3 p-5 transition-colors ${
                    pl.is_favorite_sidebar
                      ? "border-purple-400/30 bg-purple-500/[0.08]"
                      : "border-white/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                        pl.is_favorite_sidebar
                          ? "border-purple-400/40 bg-purple-500/20 text-purple-200"
                          : "border-white/10 bg-white/5 text-white/50"
                      }`}
                    >
                      {pl.is_favorite_sidebar ? (
                        <Heart className="h-5 w-5 fill-current" />
                      ) : (
                        <Music2 className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">
                        {pl.name}
                      </p>
                      <p className="mt-0.5 text-xs text-white/40">
                        {typeof pl.track_count === "number"
                          ? `${pl.track_count} parça`
                          : `Liste #${pl.id}`}
                        {pl.is_favorite_sidebar ? (
                          <span className="text-purple-300/80">
                            {" "}
                            · Kalp ile eklenir
                          </span>
                        ) : null}
                      </p>
                    </div>
                    {!pl.is_favorite_sidebar ? (
                      <button
                        type="button"
                        title="Listeyi sil"
                        disabled={deletingId === pl.id}
                        onClick={() => {
                          setDeletingId(pl.id);
                          void (async () => {
                            await deletePlaylist(pl.id);
                            setDeletingId(null);
                          })();
                        }}
                        className="rounded-lg p-2 text-white/35 transition-colors hover:bg-red-500/15 hover:text-red-300 disabled:opacity-40"
                        aria-label="Listeyi sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
