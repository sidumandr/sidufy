import { useEffect, useState } from "react";
import { LogIn, UserPlus, X } from "lucide-react";
import { hasApiBase, useMusicStore } from "../../store/useMusicStore";
import { GlassCard } from "../UI/GlassCard";

type Mode = "login" | "register";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: Mode;
}

export function AuthModal({
  open,
  onClose,
  onSuccess,
  initialMode = "login",
}: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const login = useMusicStore((s) => s.login);
  const register = useMusicStore((s) => s.register);
  const authLoading = useMusicStore((s) => s.authLoading);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setError(null);
    } else {
      setPassword("");
      setError(null);
    }
  }, [open, initialMode]);

  if (!open) return null;

  const apiOk = hasApiBase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!apiOk) {
      setError("API adresi yok. VITE_API_BASE_URL ayarla.");
      return;
    }
    try {
      if (mode === "login") {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password, email.trim() || undefined);
      }
      setPassword("");
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Kapat"
      />
      <GlassCard className="glass-noise relative z-[1] w-full max-w-md border border-white/15 p-6 shadow-2xl shadow-purple-950/50 md:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id="auth-modal-title"
          className="mb-6 text-center text-xl font-semibold text-white md:text-2xl"
        >
          Sidufy hesabın
        </h2>

        <div className="mb-6 flex gap-2 rounded-xl bg-white/5 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
              mode === "login"
                ? "bg-purple-500/30 text-purple-100 ring-1 ring-purple-400/40"
                : "text-white/45 hover:text-white/75"
            }`}
          >
            <LogIn className="h-4 w-4" />
            Giriş
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
              mode === "register"
                ? "bg-purple-500/30 text-purple-100 ring-1 ring-purple-400/40"
                : "text-white/45 hover:text-white/75"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Kayıt
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="auth-username"
              className="mb-1 block text-xs font-bold uppercase tracking-wider text-white/40"
            >
              Kullanıcı adı
            </label>
            <input
              id="auth-username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="glass-noise w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none ring-purple-500/0 transition-[box-shadow] focus:ring-2 focus:ring-purple-500/40"
              placeholder="kullanici_adi"
              required
            />
          </div>

          {mode === "register" && (
            <div>
              <label
                htmlFor="auth-email"
                className="mb-1 block text-xs font-bold uppercase tracking-wider text-white/40"
              >
                E-posta (isteğe bağlı)
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-noise w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-purple-500/40"
                placeholder="ornek@email.com"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-password"
              className="mb-1 block text-xs font-bold uppercase tracking-wider text-white/40"
            >
              Şifre
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-noise w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-purple-500/40"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200/90">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={authLoading}
            className="glass-noise w-full rounded-xl border border-purple-400/30 bg-purple-500/20 py-3 text-sm font-semibold text-white transition-all hover:bg-purple-500/30 disabled:opacity-50"
          >
            {authLoading
              ? "Bekleyin…"
              : mode === "login"
                ? "Giriş yap"
                : "Hesap oluştur"}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
