const LS_ACCESS = "sidufy_access_token";
const LS_REFRESH = "sidufy_refresh_token";
const LS_EXP = "sidufy_access_exp";

export function setTokens(access: string, refresh: string): void {
  try {
    const payload = JSON.parse(atob(access.split(".")[1]));
    localStorage.setItem(LS_ACCESS, access);
    localStorage.setItem(LS_REFRESH, refresh);
    localStorage.setItem(LS_EXP, String(payload.exp));
  } catch {
    /* ignore */
  }
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(LS_ACCESS);
    localStorage.removeItem(LS_REFRESH);
    localStorage.removeItem(LS_EXP);
  } catch {
    /* ignore */
  }
}

export function getAccessToken(): string | null {
  try {
    const exp = localStorage.getItem(LS_EXP);
    if (exp && Date.now() / 1000 > Number(exp)) {
      clearTokens();
      return null;
    }
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
  return `${base}${p}`;
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
    localStorage.setItem(LS_ACCESS, data.access);
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
