import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authApi } from "@/api";
import type { User } from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  // True only when the admin authenticated through /admin/login in this tab.
  // Dies when the tab closes — sessionStorage is tab-scoped.
  isAdminSession: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (
    employeeId: string,
    email: string,
    password: string,
  ) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ADMIN_SESSION_KEY = "sundry_admin_session";

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Read from sessionStorage on mount — survives React re-renders but
  // not tab closes. useState initializer runs once, so this is safe.
  const [isAdminSession, setIsAdminSession] = useState<boolean>(() => {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
  });

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.user);
    } catch {
      setUser(null);
    }
  }, []);

  // On mount: restore session from server cookie
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    })();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setUser(res.user);
    // Regular login never sets the admin session flag
  }, []);

  const adminLogin = useCallback(
    async (employeeId: string, email: string, password: string) => {
      const res = await authApi.adminLogin({ employeeId, email, password });
      setUser(res.user);
      // Set the tab-scoped admin flag — dies when tab closes
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      setIsAdminSession(true);
    },
    [],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await authApi.register({ name, email, password });
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — clear local state regardless
    }
    setUser(null);
    // Clear admin session flag on logout
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdminSession(false);
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isAdminSession,
    login,
    adminLogin,
    register,
    logout,
    refreshUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
