// src/contexts/AuthContext.jsx — JWT-based session management for Insurance Portal
// CR4-001: Tokens stored in memory only (not sessionStorage) to mitigate XSS token theft
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { loginAgent as apiLogin, refreshToken as apiRefresh, setTokenAccessor } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // CR4-001: All tokens in memory only — no sessionStorage
  const [session, setSession] = useState(null);
  const refreshTokenRef = useRef(null);

  const isAuthenticated = !!session?.access_token;
  const agent = session?.agent || null;

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    refreshTokenRef.current = data.refresh_token;
    const newSession = {
      access_token: data.access_token,
      agent: data.agent,
    };
    setSession(newSession);
  }, []);

  const logout = useCallback(() => {
    refreshTokenRef.current = null;
    setSession(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!refreshTokenRef.current) {
      logout();
      throw new Error('No refresh token');
    }
    try {
      const data = await apiRefresh(refreshTokenRef.current);
      setSession(prev => ({ ...prev, access_token: data.access_token }));
      return data.access_token;
    } catch {
      logout();
      throw new Error('Session expired. Please log in again.');
    }
  }, [logout]);

  const getAccessToken = useCallback(() => {
    return session?.access_token || '';
  }, [session]);

  // CR4-001: Register token accessor so api.js can get tokens from memory
  setTokenAccessor(getAccessToken);

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
