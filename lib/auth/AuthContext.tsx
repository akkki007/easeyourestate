"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export type AuthUserName = { first?: string; last?: string } | string;

export interface AuthUser {
  _id?: string;
  name?: AuthUserName;
  email?: string;
  phone?: string;
  role?: string;
  [key: string]: unknown;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const parseStoredUser = (raw: string | null): AuthUser | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? (parsed as AuthUser) : null;
  } catch {
    return null;
  }
};

const clearStorage = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getUserDisplayName = (user: AuthUser | null | undefined) => {
  if (!user?.name) return "User";
  if (typeof user.name === "string") return user.name || "User";
  return [user.name.first, user.name.last].filter(Boolean).join(" ").trim() || "User";
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const hydrateFromStorage = useCallback(() => {
    if (typeof window === "undefined") return;

    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = parseStoredUser(localStorage.getItem(USER_KEY));

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      return;
    }

    if (storedToken || storedUser) {
      clearStorage();
    }
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    hydrateFromStorage();
    setIsHydrated(true);
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onStorage = (event: StorageEvent) => {
      if (event.key === TOKEN_KEY || event.key === USER_KEY) {
        hydrateFromStorage();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [hydrateFromStorage]);

  const login = useCallback((nextToken: string, nextUser: AuthUser) => {
    if (!nextToken || !nextUser || typeof window === "undefined") return;

    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearStorage();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isHydrated,
      login,
      logout,
    }),
    [isHydrated, login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

