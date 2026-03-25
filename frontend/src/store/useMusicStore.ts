import { create } from "zustand";
import {
  apiFetch,
  apiUrl,
  clearTokens,
  normalizeApiBase,
  setTokens,
} from "../api/sidufyApi";

export interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  audioUrl: string;
  duration: number;
}

export interface UserProfile {
  daily_goal: number;
  total_listen_time: number;
  avatar_url: string | null;
  favorite_genre?: string | null;
}

export interface PlaylistSummary {
  id: number;
  name: string;
  is_favorite_sidebar: boolean;
  track_count?: number;
}

interface MusicState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  discoveryTracks: Track[];
  isLoading: boolean;
  searchResults: Track[];
  isSearching: boolean;
  profile: UserProfile | null;
  profileUsername: string | null;
  isAuthenticated: boolean;
  /** user playlists (API /playlists/) */
  userPlaylists: PlaylistSummary[];
  /** favorites list of Jamendo ids */
  favorites: string[];
  authLoading: boolean;

  setCurrentTrack: (track: Track) => void;
  setPlaying: (state: boolean) => void;
  setVolume: (val: number) => void;
  setQueue: (tracks: Track[]) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  fetchTracks: () => Promise<void>;
  searchTracks: (query: string) => Promise<Track[]>;
  fetchProfile: () => Promise<void>;
  fetchUserPlaylists: () => Promise<void>;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (track: Track) => Promise<boolean>;
  createPlaylist: (name: string) => Promise<boolean>;
  deletePlaylist: (playlistId: number) => Promise<boolean>;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    password: string,
    email?: string,
  ) => Promise<void>;
  logout: () => void;
  syncListenSeconds: (seconds: number) => Promise<void>;
  addTrackToPlaylist: (playlistId: number, track: Track) => Promise<boolean>;
  removeTrackFromPlaylist: (
    playlistId: number,
    jamendoId: string,
  ) => Promise<boolean>;
}

const CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID;
const JAMENDO_BASE_URL = "https://api.jamendo.com/v3.0/tracks/";

const FALLBACK_TRACKS: Track[] = [
  {
    id: "fallback-1",
    title: "Focus Flow",
    artist: "Sidufy Radio",
    cover: "https://picsum.photos/400/400?sig=101",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 348,
  },
  {
    id: "fallback-2",
    title: "Night Drive",
    artist: "Sidufy Radio",
    cover: "https://picsum.photos/400/400?sig=102",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: 299,
  },
];

function parseDetail(data: unknown): string {
  if (data && typeof data === "object" && "detail" in data) {
    const d = (data as { detail: unknown }).detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d) && typeof d[0] === "string") return d[0];
  }
  return "İşlem başarısız";
}

async function fetchJamendoDirect(tags?: string): Promise<Track[]> {
  const requestTracks = async (tag?: string) => {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      format: "json",
      limit: "20",
      include: "musicinfo",
      audioformat: "mp32",
      order: "popularity_total",
    });
    if (tag) params.set("tags", tag);

    const response = await fetch(`${JAMENDO_BASE_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Jamendo HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data?.headers?.status !== "success") {
      throw new Error("Jamendo status not success");
    }

    return data?.results ?? [];
  };

  let results = await requestTracks(tags);
  if (results.length === 0 && tags) {
    results = await requestTracks();
  }

  return (
    results as Array<{
      id: string;
      name: string;
      artist_name: string;
      album_image?: string;
      audio: string;
      duration: number;
    }>
  ).map((item) => ({
    id: item.id,
    title: item.name,
    artist: item.artist_name,
    cover:
      item.album_image ||
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=500",
    audioUrl: item.audio,
    duration: item.duration,
  }));
}

export const useMusicStore = create<MusicState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 70,
  queue: [],
  discoveryTracks: [],
  isLoading: false,
  searchResults: [],
  isSearching: false,
  profile: null,
  profileUsername: null,
  isAuthenticated: false,
  userPlaylists: [],
  favorites: [],
  authLoading: false,

  fetchTracks: async () => {
    set({ isLoading: true });

    const discoveryPath = "/discovery/";
    try {
      if (apiUrl(discoveryPath)) {
        const response = await apiFetch(discoveryPath);
        if (response.ok) {
          const data = (await response.json()) as { tracks?: Track[] };
          const tracks = data.tracks ?? [];
          if (tracks.length > 0) {
            set({
              queue: tracks,
              discoveryTracks: tracks,
              currentTrack: tracks[0] ?? null,
              isLoading: false,
            });
            return;
          }
        }
      }

      const mappedTracks = await fetchJamendoDirect("lofi");
      if (mappedTracks.length === 0) {
        set({
          queue: FALLBACK_TRACKS,
          discoveryTracks: FALLBACK_TRACKS,
          currentTrack: FALLBACK_TRACKS[0],
          isLoading: false,
        });
        return;
      }

      set({
        queue: mappedTracks,
        discoveryTracks: mappedTracks,
        currentTrack: mappedTracks[0] || null,
        isLoading: false,
      });
    } catch (error) {
      console.error("API Error:", error);
      set({
        queue: FALLBACK_TRACKS,
        discoveryTracks: FALLBACK_TRACKS,
        currentTrack: FALLBACK_TRACKS[0],
        isLoading: false,
      });
    }
  },

  searchTracks: async (query: string) => {
    const q = query.trim();
    if (!q) {
      set({ searchResults: [], isSearching: false });
      return [];
    }

    set({ isSearching: true });
    const searchPath = `/search/?q=${encodeURIComponent(q)}`;

    try {
      if (apiUrl("/search/")) {
        const response = await apiFetch(searchPath);
        if (response.ok) {
          const data = (await response.json()) as { tracks?: Track[] };
          const tracks = data.tracks ?? [];
          set({ searchResults: tracks, isSearching: false });
          return tracks;
        }
      }

      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        format: "json",
        limit: "30",
        include: "musicinfo",
        audioformat: "mp32",
        order: "popularity_total",
        search: q,
      });
      const response = await fetch(`${JAMENDO_BASE_URL}?${params.toString()}`);
      if (!response.ok) throw new Error(`Jamendo HTTP ${response.status}`);
      const data = await response.json();
      if (data?.headers?.status !== "success") {
        throw new Error("Jamendo status not success");
      }
      const results = data?.results ?? [];
      const tracks = (
        results as Array<{
          id: string;
          name: string;
          artist_name: string;
          album_image?: string;
          audio: string;
          duration: number;
        }>
      ).map((item) => ({
        id: item.id,
        title: item.name,
        artist: item.artist_name,
        cover:
          item.album_image ||
          "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=500",
        audioUrl: item.audio,
        duration: item.duration,
      }));
      set({ searchResults: tracks, isSearching: false });
      return tracks;
    } catch (error) {
      console.error("Search error:", error);
      set({ searchResults: [], isSearching: false });
      return [];
    }
  },

  fetchProfile: async () => {
    if (!apiUrl("/me/profile/")) return;

    try {
      const response = await apiFetch("/me/profile/");
      if (response.status === 401) {
        clearTokens();
        set({
          isAuthenticated: false,
          profile: null,
          profileUsername: null,
          userPlaylists: [],
          favorites: [],
        });
        return;
      }
      if (!response.ok) return;
      const data = (await response.json()) as {
        authenticated?: boolean;
        profile?: UserProfile | null;
        username?: string | null;
      };
      set({
        isAuthenticated: Boolean(data.authenticated),
        profile: data.profile ?? null,
        profileUsername:
          typeof data.username === "string" && data.username.trim()
            ? data.username.trim()
            : null,
      });
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  },

  fetchUserPlaylists: async () => {
    if (!apiUrl("/playlists/")) return;

    try {
      const response = await apiFetch("/playlists/");
      if (response.status === 401) {
        set({ userPlaylists: [] });
        return;
      }
      if (!response.ok) return;
      const data = (await response.json()) as { playlists?: PlaylistSummary[] };
      set({ userPlaylists: data.playlists ?? [] });
    } catch (error) {
      console.error("Playlists fetch error:", error);
    }
  },

  fetchFavorites: async () => {
    if (!apiUrl("/me/favorites/")) return;
    try {
      const response = await apiFetch("/me/favorites/");
      if (response.status === 401) {
        set({ favorites: [] });
        return;
      }
      if (!response.ok) return;
      const data = (await response.json()) as { jamendo_ids?: string[] };
      set({ favorites: data.jamendo_ids ?? [] });
    } catch (error) {
      console.error("Favorites fetch error:", error);
    }
  },

  toggleFavorite: async (track: Track) => {
    if (!get().isAuthenticated) return false;
    const path = "/me/favorites/toggle/";
    if (!apiUrl(path)) return false;
    try {
      const response = await apiFetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jamendo_id: track.id,
          track_data: {
            id: track.id,
            title: track.title,
            artist: track.artist,
            cover: track.cover,
            audioUrl: track.audioUrl,
            duration: track.duration,
          },
        }),
      });
      if (!response.ok) return false;
      const data = (await response.json()) as {
        in_favorites?: boolean;
        jamendo_id?: string;
      };
      const jid = data.jamendo_id ?? track.id;
      set((state) => {
        const setFav = new Set(state.favorites);
        if (data.in_favorites) setFav.add(jid);
        else setFav.delete(jid);
        return { favorites: Array.from(setFav) };
      });
      return true;
    } catch (error) {
      console.error("toggleFavorite:", error);
      return false;
    }
  },

  createPlaylist: async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || !get().isAuthenticated) return false;
    if (!apiUrl("/playlists/")) return false;
    try {
      const response = await apiFetch("/playlists/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!response.ok) return false;
      await get().fetchUserPlaylists();
      return true;
    } catch (error) {
      console.error("createPlaylist:", error);
      return false;
    }
  },

  deletePlaylist: async (playlistId: number) => {
    if (!get().isAuthenticated) return false;
    const path = `/playlists/${playlistId}/`;
    if (!apiUrl(path)) return false;
    try {
      const response = await apiFetch(path, { method: "DELETE" });
      if (!response.ok) return false;
      await get().fetchUserPlaylists();
      return true;
    } catch (error) {
      console.error("deletePlaylist:", error);
      return false;
    }
  },

  login: async (username: string, password: string) => {
    const tokenUrl = apiUrl("/auth/token/");
    if (!tokenUrl)
      throw new Error("API adresi tanımlı değil (VITE_API_BASE_URL).");

    set({ authLoading: true });
    try {
      const res = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(parseDetail(data));
      }
      const tokens = data as { access: string; refresh: string };
      if (!tokens.access || !tokens.refresh) {
        throw new Error("Sunucu token döndürmedi.");
      }
      setTokens(tokens.access, tokens.refresh);
      await get().fetchProfile();
      await get().fetchUserPlaylists();
      await get().fetchFavorites();
    } finally {
      set({ authLoading: false });
    }
  },

  register: async (username: string, password: string, email?: string) => {
    const regUrl = apiUrl("/auth/register/");
    if (!regUrl)
      throw new Error("API adresi tanımlı değil (VITE_API_BASE_URL).");

    set({ authLoading: true });
    try {
      const res = await fetch(regUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          email: email?.trim() || "",
        }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(parseDetail(data));
      }
      const tokens = data as { access: string; refresh: string };
      if (!tokens.access || !tokens.refresh) {
        throw new Error("Sunucu token döndürmedi.");
      }
      setTokens(tokens.access, tokens.refresh);
      await get().fetchProfile();
      await get().fetchUserPlaylists();
      await get().fetchFavorites();
    } finally {
      set({ authLoading: false });
    }
  },

  logout: () => {
    clearTokens();
    set({
      isAuthenticated: false,
      profile: null,
      profileUsername: null,
      userPlaylists: [],
      favorites: [],
    });
  },

  syncListenSeconds: async (seconds: number) => {
    const s = Math.floor(seconds);
    if (s <= 0) return;
    if (!apiUrl("/me/profile/listen/")) return;

    try {
      const res = await apiFetch("/me/profile/listen/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seconds: s }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        total_listen_time: number;
        daily_goal: number;
      };
      const prev = get().profile;
      set({
        profile: {
          daily_goal: data.daily_goal,
          total_listen_time: data.total_listen_time,
          avatar_url: prev?.avatar_url ?? null,
          favorite_genre: prev?.favorite_genre,
        },
      });
    } catch (error) {
      console.error("syncListenSeconds:", error);
    }
  },

  addTrackToPlaylist: async (playlistId: number, track: Track) => {
    const path = `/playlists/${playlistId}/tracks/`;
    if (!apiUrl(path)) return false;

    try {
      const response = await apiFetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track_data: {
            id: track.id,
            title: track.title,
            artist: track.artist,
            cover: track.cover,
            audioUrl: track.audioUrl,
            duration: track.duration,
          },
        }),
      });
      if (response.ok) void get().fetchUserPlaylists();
      return response.ok;
    } catch (error) {
      console.error("addTrackToPlaylist:", error);
      return false;
    }
  },

  removeTrackFromPlaylist: async (playlistId: number, jamendoId: string) => {
    const path = `/playlists/${playlistId}/tracks/${encodeURIComponent(jamendoId)}/`;
    if (!apiUrl(path)) return false;

    try {
      const response = await apiFetch(path, {
        method: "DELETE",
      });
      return response.ok;
    } catch (error) {
      console.error("removeTrackFromPlaylist:", error);
      return false;
    }
  },

  setCurrentTrack: (track) => set({ currentTrack: track }),
  setPlaying: (state) => set({ isPlaying: state }),
  setVolume: (val) => set({ volume: val }),
  setQueue: (tracks) => set({ queue: tracks }),

  nextTrack: () => {
    const { queue, currentTrack } = get();
    if (!currentTrack || queue.length === 0) return;

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % queue.length;

    set({ currentTrack: queue[nextIndex], isPlaying: true });
  },

  prevTrack: () => {
    const { queue, currentTrack } = get();
    if (!currentTrack || queue.length === 0) return;

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;

    set({ currentTrack: queue[prevIndex], isPlaying: true });
  },
}));

/** Dışarıdan (ör. bootstrap) API tabanı var mı kontrolü */
export function hasApiBase(): boolean {
  return Boolean(normalizeApiBase());
}
