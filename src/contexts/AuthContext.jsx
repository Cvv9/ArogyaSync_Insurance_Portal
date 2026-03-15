// src/contexts/AuthContext.jsx — Session management for Insurance Portal (UX-009)
import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem('ip_api_key') || '');

  const isAuthenticated = apiKey.length > 0;

  const login = useCallback((key) => {
    sessionStorage.setItem('ip_api_key', key);
    setApiKey(key);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('ip_api_key');
    setApiKey('');
  }, []);

  return (
    <AuthContext.Provider value={{ apiKey, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
