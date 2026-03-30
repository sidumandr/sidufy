import { Compass, Heart, Home, Library, LogIn, LogOut, User } from "lucide-react";

export type AppTab =
  | "player"
  | "explore"
  | "favorites"
  | "library"
  | "profile";

const NAV_ITEMS: { id: AppTab; label: string; icon: typeof Home }[] = [
  { id: "player", label: "Home", icon: Home },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "favorites", label: "Likes", icon: Heart },
  { id: "library", label: "Library", icon: Library },
  { id: "profile", label: "Profile", icon: User },
];

interface AppNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  isAuthenticated?: boolean;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  authLoading?: boolean;
}

export function AppNav({
  activeTab,
  onTabChange,
  isAuthenticated = false,
  onOpenAuth,
  onLogout,
  authLoading = false,
}: AppNavProps) {
  return (
    <nav className="glass-noise flex w-[4.5rem] shrink-0 flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur-2xl md:w-[5.5rem] md:gap-3 md:p-3">
      <div className="mb-1 select-none text-center font-bold tracking-tight text-purple-300/90">
        <span className="text-[10px] uppercase leading-tight md:text-xs">Sid</span>
        <span className="block text-[10px] uppercase leading-tight text-white/50 md:text-xs">
          ufy
        </span>
      </div>
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            title={label}
            className={`group flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 transition-all duration-300 md:py-2.5 ${
              active
                ? "bg-purple-500/25 text-purple-200 ring-1 ring-purple-400/40 shadow-lg shadow-purple-900/30"
                : "text-white/45 hover:bg-white/5 hover:text-white/85"
            }`}
          >
            <Icon
              className={`h-5 w-5 md:h-[1.35rem] md:w-[1.35rem] ${active ? "text-purple-300" : ""}`}
              strokeWidth={active ? 2.25 : 1.75}
            />
            <span className="hidden text-[9px] font-semibold uppercase tracking-wider md:block">
              {label}
            </span>
          </button>
        );
      })}

      <div className="mt-auto flex w-full flex-col gap-2 border-t border-white/10 pt-2">
        {isAuthenticated ? (
          <button
            type="button"
            onClick={onLogout}
            disabled={authLoading}
            title="Çıkış"
            className="flex w-full flex-col items-center gap-1 rounded-xl py-2 text-white/45 transition-colors hover:bg-white/5 hover:text-red-300/90 disabled:opacity-50"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.75} />
            <span className="hidden text-[8px] font-semibold uppercase tracking-wider md:block">
              Çıkış
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            disabled={authLoading}
            title="Giriş yap"
            className="flex w-full flex-col items-center gap-1 rounded-xl py-2 text-purple-200/80 transition-colors hover:bg-purple-500/15 hover:text-purple-100 disabled:opacity-50"
          >
            <LogIn className="h-5 w-5" strokeWidth={1.75} />
            <span className="hidden text-[8px] font-semibold uppercase tracking-wider md:block">
              Giriş
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}
