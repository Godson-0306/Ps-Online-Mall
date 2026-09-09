import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginUser, registerUser } from '../services/api.js';
import { readStorage, removeStorage, writeStorage } from '../utils/storage.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'auth';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => readStorage(STORAGE_KEY, { token: null, user: null }));
  const [ready, setReady] = useState(false);

  const persist = useCallback((next) => {
    setAuth(next);
    if (next?.token) {
      writeStorage(STORAGE_KEY, next);
    } else {
      removeStorage(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const stored = readStorage(STORAGE_KEY, { token: null, user: null });
      if (!stored.token) {
        setReady(true);
        return;
      }

      try {
        const user = await getCurrentUser(stored.token);
        if (!cancelled) {
          persist({ token: stored.token, user });
        }
      } catch {
        if (!cancelled) {
          persist({ token: null, user: null });
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [persist]);

  const login = useCallback(
    async (credentials) => {
      const next = await loginUser(credentials);
      persist(next);
      return next;
    },
    [persist],
  );

  const register = useCallback(
    async (payload) => {
      const next = await registerUser(payload);
      persist(next);
      return next;
    },
    [persist],
  );

  const logout = useCallback(() => {
    persist({ token: null, user: null });
  }, [persist]);

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      ready,
      isAuthenticated: Boolean(auth.token && auth.user),
      isAdmin: auth.user?.role === 'admin',
      login,
      register,
      logout,
    }),
    [auth.token, auth.user, ready, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
