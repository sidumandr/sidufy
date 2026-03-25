const LS_ACCESS = "sidufy_access_token";
const LS_REFRESH = "sidufy_refresh_token";

export function normalizeApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return "";
  }
  return String(raw).replace(/\/$/, "");
}

export function apiUrl(path: string): string | null {
  const base = normalizeApiBase();
  if (!base) return null;
  const p = path.startsWith("/") ? path : `/${path}`;
  if (base.startsWith("http")) {
    return `${base}${p}`;
  }
  return `${base}${p}`;
}

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(LS_ACCESS);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(LS_REFRESH);
  } catch {
    return null;
  }
}

export function setTokens(access: string, refresh: string): void {
  try {
    localStorage.setItem(LS_ACCESS, access);
    localStorage.setItem(LS_REFRESH, refresh);
  } catch {
    /* ignore */
  }
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(LS_ACCESS);
    localStorage.removeItem(LS_REFRESH);
  } catch {
    /* ignore */
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  const url = apiUrl("/auth/token/refresh/");
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
      credentials: "include",
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { access?: string };
    if (!data.access) return false;
    try {
      localStorage.setItem(LS_ACCESS, data.access);
    } catch {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  allowRetry = true,
): Promise<Response> {
  const url = apiUrl(path);
  if (!url) {
    return Promise.reject(new Error("VITE_API_BASE_URL tanımlı değil."));
  }

  const headers = new Headers(init.headers);
  const access = getAccessToken();
  if (access) {
    headers.set("Authorization", `Bearer ${access}`);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  if (
    res.status === 401 &&
    allowRetry &&
    getRefreshToken() &&
    (await refreshAccessToken())
  ) {
    return apiFetch(path, init, false);
  }

  return res;
}
