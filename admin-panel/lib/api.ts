import Cookies from "js-cookie";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export function authHeaders(): Record<string, string> {
  const token = Cookies.get("authToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers as Record<string, string> | undefined) },
  });

  // A revoked or expired token means the session is over — clear it and bounce
  // to login rather than letting every caller render an error state. This runs
  // outside React (no router available), and a hard navigation is what we want
  // anyway: it tears down every cached RSC payload and context holding data the
  // user is no longer entitled to.
  if (res.status === 401 && typeof window !== "undefined") {
    Cookies.remove("authToken");
    Cookies.remove("permissions");
    if (!window.location.pathname.startsWith("/auth/")) {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- deliberate full reload to clear all client state on session loss
      window.location.href = "/auth/login";
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || "Request failed");
  }
  return res.json() as Promise<T>;
}

// Authenticated file download (e.g. a private CV) — returns the raw bytes.
export async function apiBlob(path: string): Promise<Blob> {
  const token = Cookies.get("authToken");
  const res = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 401 && typeof window !== "undefined") {
    Cookies.remove("authToken");
    Cookies.remove("permissions");
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- same session-loss handling as apiFetch
    window.location.href = "/auth/login";
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Download failed" }));
    throw new Error(err.message || "Download failed");
  }
  return res.blob();
}

// Multipart upload — deliberately does NOT set Content-Type so the browser adds
// the multipart boundary itself.
export async function apiUpload<T = unknown>(
  path: string,
  file: File,
  field = "file"
): Promise<T> {
  const token = Cookies.get("authToken");
  const form = new FormData();
  form.append(field, file);
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(err.message || "Upload failed");
  }
  return res.json() as Promise<T>;
}
