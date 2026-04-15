'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  loginUser,
  getMe,
  saveAuthSession,
  clearAuthSession,
  getStoredToken,
  getStoredUser
} from '@/services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const boot = async () => {
      try {
        const storedToken = getStoredToken();
        const storedUser = getStoredUser();

        if (!storedToken || !storedUser) {
          setLoadingAuth(false);
          return;
        }

        const me = await getMe(storedToken);
        setToken(storedToken);
        setUser(me.user);
      } catch (error) {
        clearAuthSession();
        setToken(null);
        setUser(null);
      } finally {
        setLoadingAuth(false);
      }
    };

    boot();
  }, []);

  const login = async (email, password) => {
    const result = await loginUser({ email, password });
    saveAuthSession(result.token, result.user);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  };

  const logout = () => {
    clearAuthSession();
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const value = useMemo(() => ({
    user,
    token,
    loadingAuth,
    isAuthenticated: !!user,
    login,
    logout,
  }), [user, token, loadingAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}