"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface AuthUser { id: string; email: string; name: string; role: "golfer" | "admin"; isAdmin: boolean; }
interface Ctx { user: AuthUser | null; loading: boolean; refresh: () => Promise<void>; logout: () => Promise<void>; }
const AuthCtx = createContext<Ctx>({ user: null, loading: true, refresh: async () => {}, logout: async () => {} });

export function useAuth() { return useContext(AuthCtx); }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch { setUser(null); }
    finally { setLoading(false); }
  };
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  useEffect(() => { refresh(); }, []);
  return <AuthCtx.Provider value={{ user, loading, refresh, logout }}>{children}</AuthCtx.Provider>;
}
