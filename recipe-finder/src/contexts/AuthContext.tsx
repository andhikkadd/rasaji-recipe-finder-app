import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  likedIds: string[];
  bookmarkedIds: string[];
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Refresh user data (likes/bookmarks) from server */
  refreshUser: () => Promise<void>;
  /** Check if a recipe is liked by current user */
  hasLiked: (recipeId: string) => boolean;
  /** Check if a recipe is bookmarked by current user */
  hasBookmarked: (recipeId: string) => boolean;
  /** Optimistically update local like/bookmark state */
  updateAction: (recipeId: string, type: 'like' | 'bookmark', add: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch session on mount
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data && data.id) {
          setUser(data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login gagal');
    // Fetch full user data with likedIds/bookmarkedIds
    const meRes = await fetch('/api/auth/me', { credentials: 'include' });
    const me = await meRes.json();
    setUser(me);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registrasi gagal');
    // Fetch full user data
    const meRes = await fetch('/api/auth/me', { credentials: 'include' });
    const me = await meRes.json();
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json();
      if (data && data.id) setUser(data);
    } catch {}
  }, []);

  const hasLiked = useCallback((recipeId: string) => {
    return user?.likedIds?.includes(recipeId) || false;
  }, [user]);

  const hasBookmarked = useCallback((recipeId: string) => {
    return user?.bookmarkedIds?.includes(recipeId) || false;
  }, [user]);

  const updateAction = useCallback((recipeId: string, type: 'like' | 'bookmark', add: boolean) => {
    setUser(prev => {
      if (!prev) return prev;
      const field = type === 'like' ? 'likedIds' : 'bookmarkedIds';
      const current = prev[field] || [];
      return {
        ...prev,
        [field]: add
          ? [...current, recipeId]
          : current.filter(id => id !== recipeId),
      };
    });
  }, []);

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    hasLiked,
    hasBookmarked,
    updateAction,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
