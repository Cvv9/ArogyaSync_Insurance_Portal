// src/contexts/AuthContext.jsx — JWT-based session management for Insurance Portal
// CR4-001: Tokens stored in memory only (not sessionStorage) to mitigate XSS token theft
// CR4-042: Proactive token refresh before expiry
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { loginAgent as apiLogin, refreshToken as apiRefresh, setTokenAccessor } from '../api';

const AuthContext = createContext(null);

/** Decode JWT payload without external library. */
function parseJwtExp(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    const payload = JSON.parse(json);
    return payload.exp || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // CR4-001: All tokens in memory only — no sessionStorage
  const [session, setSession] = useState(null);
  const refreshTokenRef = useRef(null);
  const refreshTimerRef = useRef(null);

  const isAuthenticated = !!session?.access_token;
  const agent = session?.agent || null;

  /** CR4-042: Schedule proactive refresh 5 minutes before token expiry. */
  const scheduleTokenRefresh = useCallback((accessToken, refreshFn) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    if (!accessToken) return;

    const exp = parseJwtExp(accessToken);
    if (!exp) return;

    const msUntilExpiry = exp * 1000 - Date.now();
    const BUFFER = 5 * 60 * 1000; // 5 min

    if (msUntilExpiry > BUFFER) {
      refreshTimerRef.current = setTimeout(async () => {
        try {
          await refreshFn();
        } catch {
          // refresh() already calls logout on failure
        }
      }, msUntilExpiry - BUFFER);
    }
  }, []);

  const logout = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTokenRef.current = null;
    // CR5-044: Clear any localStorage items (defensive cleanup even though tokens are memory-only)
    try {
      localStorage.removeItem('insurance-portal-session');
    } catch { /* silent fail */ }
    // Clear session state (setToken equivalent: setSession to null)
    setSession(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!refreshTokenRef.current) {
      logout();
      throw new Error('No refresh token');
    }
    try {
      // Call refresh API endpoint via request wrapper
      const data = await apiRefresh(refreshTokenRef.current);
      setSession(prev => ({ ...prev, access_token: data.access_token }));
      scheduleTokenRefresh(data.access_token, refresh);
      return data.access_token;
    } catch {
      logout();
      throw new Error('Session expired. Please log in again.');
    }
  }, [logout, scheduleTokenRefresh]);

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    refreshTokenRef.current = data.refresh_token;
    const newSession = {
      access_token: data.access_token,
      agent: data.agent,
    };
    setSession(newSession);
    scheduleTokenRefresh(data.access_token, refresh);
  }, [scheduleTokenRefresh, refresh]);

  const getAccessToken = useCallback(() => {
    return session?.access_token || '';
  }, [session]);

  // CR4-001: Register token accessor so api.js can get tokens from memory
  setTokenAccessor(getAccessToken);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, agent, login, logout, refresh, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
