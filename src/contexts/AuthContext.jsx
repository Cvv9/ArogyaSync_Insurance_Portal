// src/contexts/AuthContext.jsx — JWT-based session management for Insurance Portal
import { createContext, useContext, useState, useCallback } from 'react';
import { loginAgent as apiLogin, refreshToken as apiRefresh } from '../api';

const AuthContext = createContext(null);

function loadSession() {
  try {
    const stored = sessionStorage.getItem('ip_session');
    if (!stored) return null;
    const session = JSON.parse(stored);
    // Check if access token is likely expired (rough check — server validates precisely)
    if (session.access_token && session.agent) return session;
  } catch { /* ignore corrupted storage */ }
  return null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  const isAuthenticated = !!session?.access_token;
  const agent = session?.agent || null;

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    const newSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      agent: data.agent,
    };
    sessionStorage.setItem('ip_session', JSON.stringify(newSession));
    setSession(newSession);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('ip_session');
    setSession(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!session?.refresh_token) {
      logout();
      throw new Error('No refresh token');
    }
    try {
      const data = await apiRefresh(session.refresh_token);
      const updated = { ...session, access_token: data.access_token };
      sessionStorage.setItem('ip_session', JSON.stringify(updated));
      setSession(updated);
      return data.access_token;
    } catch {
      logout();
      throw new Error('Session expired. Please log in again.');
    }
  }, [session, logout]);

  const getAccessToken = useCallback(() => {
    return session?.access_token || '';
  }, [session]);

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
