import { useEffect } from "react";
import { Headphones, Target, UserRound } from "lucide-react";
import { useMusicStore } from "../store/useMusicStore";
import { GlassCard } from "../components/UI/GlassCard";

function formatListenTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0 dk";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h} sa ${m} dk`;
  return `${m} dk`;
}

export function ProfileView() {
  const profile = useMusicStore((s) => s.profile);
  const isAuthenticated = useMusicStore((s) => s.isAuthenticated);
  const profileUsername = useMusicStore((s) => s.profileUsername);
  const fetchProfile = useMusicStore((s) => s.fetchProfile);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const displayName =
    profileUsername?.trim() ||
    (isAuthenticated ? "Sidufy kullanıcısı" : "Misafir dinleyici");

  const dailyGoalMin = profile?.daily_goal ?? 60;
  const totalSec = profile?.total_listen_time ?? 0;
  const goalSeconds = Math.max(dailyGoalMin * 60, 1);
  const progressPct = Math.min(100, Math.round((totalSec / goalSeconds) * 100));

  const favoriteGenre =
    profile?.favorite_genre?.trim() || "Lofi & ambient";

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-6 py-4">
      <GlassCard className="glass-noise relative w-full max-w-lg overflow-hidden p-8 md:p-10">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(192,132,252,0.5) 0%, transparent 70%)",
          }}
        />
        <div className="relative flex flex-col items-center text-center">
          <div className="glass-noise mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/15 shadow-xl shadow-purple-900/40">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound className="h-11 w-11 text-purple-300/80" strokeWidth={1.5} />
            )}
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            {displayName}
          </h1>
          <p className="mt-1 text-sm text-white/45">
            {isAuthenticated ? "Hesabın bağlı" : "Giriş yapınca istatistikler senkron olur"}
          </p>

          <div className="mt-8 w-full space-y-5 text-left">
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                  <Target className="h-3.5 w-3.5 text-purple-400" />
                  Günlük hedef
                </span>
                <span className="text-xs font-semibold text-purple-200/90">
                  {dailyGoalMin} dk
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/35">
                Toplam dinleme süreni günlük hedef süresine göre oranladık; tam
                günlük rapor API ile genişletilebilir.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                <Headphones className="h-3.5 w-3.5 text-purple-400" />
                Toplam dinleme
              </span>
              <span className="text-sm font-semibold text-white/90">
                {formatListenTime(totalSec)}
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                Favori tür
              </p>
              <p className="mt-1 text-lg font-medium text-purple-200/95">
                {favoriteGenre}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
