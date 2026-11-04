import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '/api';
const KEY = 'nx_admin_refresh';
const store = {
  get: () => { try { return localStorage.getItem(KEY); } catch { return null; } },
  set: (v) => { try { localStorage.setItem(KEY, v); } catch { /* private mode */ } },
  del: () => { try { localStorage.removeItem(KEY); } catch { /* private mode */ } },
};

const state = { access: null, refresh: store.get(), onLogout: null };
export const hasSession = () => !!state.refresh;
export const onSessionEnded = (fn) => { state.onLogout = fn; };

export function setTokens({ accessToken, refreshToken }, remember = true) {
  state.access = accessToken;
  state.refresh = refreshToken;
  if (remember) store.set(refreshToken); else store.del();
}
export function clearTokens() { state.access = null; state.refresh = null; store.del(); }

const api = axios.create({ baseURL: BASE, timeout: 20000 });
api.interceptors.request.use((c) => { if (state.access) c.headers.Authorization = `Bearer ${state.access}`; return c; });

let refreshing = null;
export function refreshSession() {
  if (!state.refresh) return Promise.reject(new Error('No session'));
  if (!refreshing) {
    refreshing = axios.post(`${BASE}/auth/refresh`, { refreshToken: state.refresh })
      .then(({ data }) => { setTokens(data, !!store.get()); return data; })
      .finally(() => { refreshing = null; });
  }
  return refreshing;
}

api.interceptors.response.use((r) => r, async (err) => {
  const cfg = err.config;
  const authCall = cfg && cfg.url && /^\/auth\/(login|refresh|forgot)/.test(cfg.url);
  if (err.response && err.response.status === 401 && cfg && !cfg._retry && !authCall && state.refresh) {
    cfg._retry = true;
    try { await refreshSession(); return api(cfg); } catch { clearTokens(); if (state.onLogout) state.onLogout(); }
  }
  return Promise.reject(err);
});

export const errorText = (e) => (e && e.response && e.response.data && e.response.data.error) || (e && e.message === 'Network Error' ? 'Cannot reach the API server. Is it running on port 4000?' : (e && e.message) || 'Something went wrong');

// Open an export / PDF in a new tab with a 2-minute download token.
export async function download(path) {
  const win = window.open('', '_blank');
  const { data } = await api.post('/auth/download-token');
  const url = `${BASE}${path}${path.includes('?') ? '&' : '?'}access_token=${data.token}`;
  if (win) win.location.href = url; else window.location.href = url;
}

export default api;
