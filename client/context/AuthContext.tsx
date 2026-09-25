'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
  useTransition,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  SessionUser,
  getToken,
  getUser,
  saveSession as persistSession,
  clearSession as removeSession,
  updateSessionUser as persistUserUpdates,
  subscribeToSession,
} from '@/lib/auth-client';

export interface AuthContextType {
  user: SessionUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isWorker: boolean;
  isCustomer: boolean;
  role: string | null;
  login: (token: string, user: SessionUser) => void;
  logout: (redirectUrl?: string) => void;
  updateUser: (updates: Partial<SessionUser>) => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pending, startTransition] = useTransition();

  // Sync state with client cookies / store
  const syncAuth = useCallback(() => {
    const currentToken = getToken();
    const currentUser = getUser();
    startTransition(() => {
      setToken(currentToken);
      setUser(currentUser);
      setIsLoading(false);
    })
  }, []);

  // Hydrate on mount & listen for session changes across tabs/windows
  useEffect(() => {
    syncAuth();
    const unsubscribe = subscribeToSession(syncAuth);
    return () => unsubscribe();
  }, [syncAuth]);

  const login = useCallback((newToken: string, newUser: SessionUser) => {
    persistSession(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
    setIsLoading(false);
  }, []);

  const logout = useCallback(
    (redirectUrl: string = '/login') => {
      removeSession();
      setToken(null);
      setUser(null);
      setIsLoading(false);
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    },
    [router]
  );

  const updateUser = useCallback((updates: Partial<SessionUser>) => {
    persistUserUpdates(updates);
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      isWorker: user?.role === 'WORKER',
      isCustomer: user?.role === 'CUSTOMER',
      role: user?.role ?? null,
      login,
      logout,
      updateUser,
      refresh: syncAuth,
    }),
    [user, token, isLoading, login, logout, updateUser, syncAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
