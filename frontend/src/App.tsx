"use client";

import { useEffect, useRef, useState } from "react";
import { AuthModal } from "./components/auth/AuthModal";
import { AppNav, type AppTab } from "./components/layout/AppNav";
import { MainPlayer } from "./components/Player/MainPlayer";
import { MiniPlayer } from "./components/Player/MiniPlayer";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { GlassCard } from "./components/UI/GlassCard";
import { hasApiBase, useMusicStore } from "./store/useMusicStore";
import { DiscoveryView } from "./views/DiscoveryView";
import { FavoritesView } from "./views/FavoritesView";
import { PlaylistView } from "./views/PlaylistView";
import { ProfileView } from "./views/ProfileView";

const COLORS = {
  background: "#0d0a14",
  primary: "#c084fc",
};

export default function App() {
  const {
    currentTrack,
    isPlaying,
    volume,
    queue,
    fetchTracks,
    fetchProfile,
    fetchUserPlaylists,
    fetchFavorites,
    setCurrentTrack,
    nextTrack,
    isLoading,
    isAuthenticated,
    syncListenSeconds,
    logout,
    authLoading,
  } = useMusicStore();

  const [activeTab, setActiveTab] = useState<AppTab>("player");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gradientPos, setGradientPos] = useState({ x: 0, y: 0 });
  const [isLeftNavOpen, setIsLeftNavOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number | null>(null);
  const hasFetchedRef = useRef(false);
  const pendingListenSecondsRef = useRef(0);
  const apiAvailable = hasApiBase();

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    void fetchTracks();
    void fetchProfile();
  }, [fetchTracks, fetchProfile]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchUserPlaylists();
    void fetchFavorites();
  }, [isAuthenticated, fetchUserPlaylists, fetchFavorites]);

  useEffect(() => {
    if (!isAuthenticated) {
      pendingListenSecondsRef.current = 0;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!apiAvailable || !isAuthenticated) return;
    const id = window.setInterval(() => {
      if (!useMusicStore.getState().isPlaying) return;
      pendingListenSecondsRef.current += 1;
      if (pendingListenSecondsRef.current >= 30) {
        pendingListenSecondsRef.current -= 30;
        void syncListenSeconds(30);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [apiAvailable, isAuthenticated, syncListenSeconds]);

  useEffect(() => {
    if (!currentTrack && queue.length > 0) {
      setCurrentTrack(queue[0]);
    }
  }, [currentTrack, queue, setCurrentTrack]);

  useEffect(() => {
    if (activeTab !== "player") {
      setFocusMode(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    let time = 0;
    const animate = () => {
      time += 0.002;
      setGradientPos({
        x: Math.sin(time) * 20 + 50,
        y: Math.cos(time * 0.7) * 20 + 50,
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleTimeUpdate = () => {
    if (audioRef.current) setProgress(audioRef.current.currentTime);
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
    setProgress(time);
  };

  const handleTrackEnded = () => {
    if (
      apiAvailable &&
      isAuthenticated &&
      pendingListenSecondsRef.current > 0
    ) {
      const rest = pendingListenSecondsRef.current;
      pendingListenSecondsRef.current = 0;
      void syncListenSeconds(rest);
    }
    nextTrack();
  };

  const isPlayerTab = activeTab === "player";

  if (isLoading && queue.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0d0d12] text-purple-400">
        <div className="animate-pulse text-xl font-bold tracking-widest uppercase">
          Sidufy Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden font-sans text-[#e8e4f0] transition-[padding] duration-500 ease-out"
      style={{ backgroundColor: COLORS.background }}
    >
      <style>{`@keyframes equalizer { from { transform: scaleY(0.5); } to { transform: scaleY(1); } }`}</style>

      {/* bg effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute h-[600px] w-[600px] rounded-full opacity-30 blur-[120px] transition-all duration-[3000ms]"
          style={{
            background: `radial-gradient(circle, ${COLORS.primary} 0%, transparent 70%)`,
            left: `${gradientPos.x - 20}%`,
            top: `${gradientPos.y - 30}%`,
          }}
        />
      </div>
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {currentTrack ? (
        <audio
          ref={audioRef}
          src={currentTrack.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleTrackEnded}
        />
      ) : null}

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          void fetchProfile();
          void fetchUserPlaylists();
          void fetchFavorites();
        }}
      />

      <button
        onClick={() => setIsLeftNavOpen(true)}
        className="lg:hidden fixed top-6 left-6 z-[60] flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/20 bg-[#0d0a14]/60 text-purple-400 shadow-lg backdrop-blur-md transition-all active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {isPlayerTab && currentTrack && (
        <button
          onClick={() => setIsRightSidebarOpen(true)}
          className="lg:hidden fixed top-6 right-6 z-[60] flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/20 bg-[#0d0a14]/60 text-purple-400 shadow-lg backdrop-blur-md transition-all active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15V6M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 12H3M16 6H3M12 18H3" />
          </svg>
        </button>
      )}

      {/* main layout */}

      <main className="relative flex min-h-screen items-stretch justify-center gap-4 p-4 pt-24 md:gap-6 md:p-6 lg:pt-6">
        {/* AppNav */}
        <div
          className={`
          fixed inset-0 z-[100] transition-all duration-300
          lg:relative lg:inset-auto lg:z-auto lg:visible lg:opacity-100 lg:flex lg:w-auto lg:shrink-0 lg:transition-none
          ${isLeftNavOpen ? "visible" : "invisible delay-300"}
        `}
        >
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isLeftNavOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setIsLeftNavOpen(false)}
          />
          {/* Menu Content */}
          <div
            className={`
            absolute inset-y-0 left-0 transform transition-transform duration-300 ease-out
            lg:relative lg:inset-auto lg:transform-none lg:transition-none
            ${isLeftNavOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          >
            <AppNav
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setIsLeftNavOpen(false);
              }}
              isAuthenticated={isAuthenticated}
              authLoading={authLoading}
              onOpenAuth={() => {
                setAuthModalOpen(true);
                setIsLeftNavOpen(false);
              }}
              onLogout={() => {
                logout();
                setIsLeftNavOpen(false);
              }}
            />
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {activeTab === "player" && (
            <div className="flex w-full flex-1 flex-col items-center justify-center min-h-0 transition-opacity duration-500 ease-out">
              {currentTrack ? (
                <div
                  className={`flex w-full max-w-6xl flex-1 flex-col items-stretch justify-center gap-10 transition-all duration-500 ease-out min-h-0 ${
                    focusMode ? "lg:flex-col lg:items-center" : "lg:flex-row"
                  }`}
                >
                  {/* main player */}
                  <div
                    className={`flex w-full min-h-0 min-w-0 shrink-0 justify-center transition-all duration-500 ${
                      focusMode ? "lg:w-full" : "lg:w-[65%]"
                    }`}
                  >
                    <MainPlayer
                      focusMode={focusMode}
                      onToggleFocus={() => setFocusMode((prev) => !prev)}
                      progress={progress}
                      onSeek={handleSeek}
                    />
                  </div>

                  {/* Up Next */}

                  <div
                    className={`
                    fixed inset-0 z-[100] transition-all duration-300
                    lg:relative lg:inset-auto lg:z-auto lg:visible lg:opacity-100 lg:w-[380px] lg:min-w-[380px] lg:flex-col lg:transition-none lg:min-h-0 lg:self-stretch
                    ${isRightSidebarOpen ? "visible" : "invisible delay-300"}
                    ${focusMode ? "lg:hidden" : "lg:flex"}
                  `}
                  >
                    <div
                      className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isRightSidebarOpen ? "opacity-100" : "opacity-0"}`}
                      onClick={() => setIsRightSidebarOpen(false)}
                    />
                    <div
                      className={`
                      absolute inset-y-0 right-0 h-full w-80 transform transition-transform duration-300 ease-out
                      lg:relative lg:inset-auto lg:h-full lg:w-full lg:transform-none lg:transition-none
                      ${isRightSidebarOpen ? "translate-x-0" : "translate-x-full"}
                    `}
                    >
                      <div className="h-full w-full overflow-y-auto bg-[#0d0a14] p-4 lg:bg-transparent lg:p-0 lg:h-full lg:flex lg:flex-col">
                        <Sidebar
                          isVisible={!focusMode || isRightSidebarOpen}
                          onNavigateTab={(tab) => {
                            setActiveTab(tab);
                            setIsRightSidebarOpen(false);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <GlassCard className="glass-noise max-w-md p-10 text-center text-white/55">
                  Oynatılacak parça yok. Sol menüden Keşfet sekmesine git.
                </GlassCard>
              )}
            </div>
          )}

          {activeTab === "explore" && (
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col pb-8 pt-1 transition-all duration-500 ease-out md:pr-2">
              <DiscoveryView onTrackPlay={() => setActiveTab("player")} />
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col pb-8 pt-1 transition-all duration-500 ease-out md:pr-2">
              <FavoritesView onTrackPlay={() => setActiveTab("player")} />
            </div>
          )}

          {activeTab === "library" && (
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col pb-8 pt-1 transition-all duration-500 ease-out md:pr-2">
              <PlaylistView />
            </div>
          )}

          {activeTab === "profile" && (
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col pb-8 pt-1 transition-all duration-500 ease-out md:pr-2">
              <ProfileView />
            </div>
          )}
        </div>
      </main>

      {!isPlayerTab && (
        <div className="fixed inset-x-0 bottom-0 z-[90] flex justify-center p-4 sm:inset-auto sm:top-6 sm:right-6 sm:bottom-auto">
          <div className="w-full max-w-sm sm:w-auto">
            <MiniPlayer />
          </div>
        </div>
      )}
    </div>
  );
}
