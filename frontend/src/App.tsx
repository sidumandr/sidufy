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
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
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

      <main className="relative flex min-h-screen items-stretch justify-center gap-4 p-4 md:gap-6 md:p-6">
        <AppNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isAuthenticated={isAuthenticated}
          authLoading={authLoading}
          onOpenAuth={() => setAuthModalOpen(true)}
          onLogout={() => logout()}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {activeTab === "player" && (
            <div className="flex w-full flex-1 flex-col items-center justify-center min-h-0 transition-opacity duration-500 ease-out">
              {currentTrack ? (
                <div
                  className={`flex w-full max-w-6xl flex-1 flex-col items-start justify-center gap-10 transition-all duration-500 ease-out min-h-0 ${
                    focusMode ? "lg:flex-col lg:items-center" : "lg:flex-row"
                  }`}
                >
                  <div
                    className={`flex w-full min-h-0 min-w-0 shrink-0 justify-center ${
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
                  <Sidebar isVisible={!focusMode} />
                </div>
              ) : (
                <GlassCard className="glass-noise max-w-md p-10 text-center text-white/55">
                  Oynatılacak parça yok. Keşfet sekmesinden bir seçim yap veya
                  yenile.
                </GlassCard>
              )}
            </div>
          )}

          {activeTab === "explore" && (
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col pb-8 pt-1 transition-all duration-500 ease-out md:pr-2">
              <DiscoveryView onTrackPlay={() => setActiveTab("player")} />
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

      {!isPlayerTab ? <MiniPlayer /> : null}
    </div>
  );
}
