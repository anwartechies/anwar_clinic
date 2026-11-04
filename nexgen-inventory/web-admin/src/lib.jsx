import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api, { errorText } from './api';

// ---------- formatting ----------
export function inr(n, decimals = 0) {
  const v = Number(n || 0);
  return `${v < 0 ? '−' : ''}₹${Math.abs(v).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}
export function inrShort(n) {
  const v = Math.abs(Number(n || 0));
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(1)} Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(1)} L`;
  if (v >= 1e3) return `₹${(v / 1e3).toFixed(1)}k`;
  return `₹${Math.round(v)}`;
}
const TZ = 'Asia/Kolkata';
export const num = (n) => Number(n || 0).toLocaleString('en-IN');
export const time = (d) => (d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ }) : '');
export const date = (d, o = {}) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', timeZone: TZ, ...o }) : '');
export const dateTime = (d) => (d ? `${date(d)}, ${time(d)}` : '');
export const monthYear = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', timeZone: TZ }) : '');
export function ago(d) {
  if (!d) return '';
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 172800) return 'yesterday';
  return date(d);
}
export const initials = (name = '') => name.replace(/^Dr\.?\s+/i, '').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
export const signed = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');
export const iso = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: TZ });
export const daysLeft = (d) => Math.round((new Date(d) - new Date(iso(new Date()))) / 86400000);

// ---------- data hooks ----------
export function useFetch(path, params) {
  const [state, set] = useState({ data: null, error: null, loading: true });
  const key = JSON.stringify([path, params]);
  const alive = useRef(true);
  const load = useCallback(async () => {
    if (!path) return;
    try {
      const { data } = await api.get(path, { params });
      if (alive.current) set({ data, error: null, loading: false });
    } catch (e) {
      if (alive.current) set((s) => ({ ...s, error: errorText(e), loading: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => { alive.current = true; set((s) => ({ ...s, loading: true })); load(); return () => { alive.current = false; }; }, [load]);
  return { ...state, reload: load, setData: (data) => set((s) => ({ ...s, data })) };
}

// ---------- toasts ----------
const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [t, setT] = useState(null);
  const show = useCallback((msg, err = false) => { setT({ msg, err }); setTimeout(() => setT(null), 3200); }, []);
  return <ToastCtx.Provider value={show}>{children}{t ? <div className={`toast ${t.err ? 'err' : ''}`} role="status">{t.msg}</div> : null}</ToastCtx.Provider>;
}
export const useToast = () => useContext(ToastCtx);

// Run a mutating call: busy flag + error toast.
export function useAction() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const run = useCallback(async (fn, okMsg) => {
    setBusy(true);
    try { const r = await fn(); if (okMsg) toast(okMsg); return r; } catch (e) { toast(errorText(e), true); return undefined; } finally { setBusy(false); }
  }, [toast]);
  return [busy, run];
}
