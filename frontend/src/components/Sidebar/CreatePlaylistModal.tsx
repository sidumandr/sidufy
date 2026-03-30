import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useMusicStore } from "../../store/useMusicStore";
import { GlassCard } from "../UI/GlassCard";

interface CreatePlaylistModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePlaylistModal({ open, onClose }: CreatePlaylistModalProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const createPlaylist = useMusicStore((s) => s.createPlaylist);

  useEffect(() => {
    if (open) {
      setName("");
      setSaving(false);
    }
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    const ok = await createPlaylist(trimmed);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-pl-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Kapat"
      />
      <GlassCard className="glass-noise relative z-10 w-full max-w-sm border border-purple-400/20 p-6 shadow-2xl shadow-purple-950/50">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 id="create-pl-title" className="text-lg font-semibold text-white">
            Yeni çalma listesi
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/45 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submit();
          }}
          placeholder="Liste adı"
          autoFocus
          className="glass-noise mb-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-purple-400/40 focus:outline-none"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-white/55 hover:bg-white/5"
          >
            Vazgeç
          </button>
          <button
            type="button"
            disabled={saving || !name.trim()}
            onClick={() => void submit()}
            className="rounded-xl border border-purple-400/35 bg-purple-500/20 px-4 py-2 text-sm font-medium text-purple-100 transition-colors hover:bg-purple-500/30 disabled:opacity-40"
          >
            {saving ? "Kaydediliyor…" : "Oluştur"}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
