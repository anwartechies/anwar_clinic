import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api, { clearTokens, hasSession, onSessionEnded, refreshSession, setTokens } from './api';

const Ctx = createContext(null);

function browserName() {
  const ua = navigator.userAgent;
  const b = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const os = /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /Linux/.test(ua) ? 'Linux' : '';
  return `${b}${os ? ` · ${os}` : ''} · Admin console`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    onSessionEnded(() => { setUser(null); setNotice('Your session ended. Please sign in again.'); });
    if (!hasSession()) { setReady(true); return; }
    refreshSession().then((d) => setUser(d.user)).catch(() => clearTokens()).finally(() => setReady(true));
  }, []);

  const signIn = useCallback(async (identifier, password, remember) => {
    const { data } = await api.post('/auth/login', { identifier, password, remember, client: 'web', device: { name: browserName(), platform: 'web' } });
    setTokens(data, remember);
    setNotice(null);
    setUser(data.user);
  }, []);

  const signOut = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* already gone */ }
    clearTokens();
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, ready, notice, signIn, signOut, setUser }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
