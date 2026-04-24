import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authAPI.getMe();
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    setUser(res.data.user);
    return res.data;
  }, []);

  const register = useCallback(async (email, username, password) => {
    const res = await authAPI.register({ email, username, password });
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
