"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/src/lib/auth/auth-service";
import type {
  AuthError,
  AuthSession,
  AuthStatus,
  LoginCredentials,
  Permission,
  UserRole,
} from "@/src/lib/auth/types";
import { hasPermission, hasRole } from "@/src/lib/auth/route-guard";
import { userCan } from "@/src/lib/rbac/permissions";
import type { PermissionAction } from "@/src/lib/auth/types";

export interface AuthContextValue {
  status: AuthStatus;
  session: AuthSession | null;
  user: AuthSession["user"] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    credentials: LoginCredentials
  ) => Promise<{ success: true } | { success: false; error: AuthError }>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  checkPermission: (permission: Permission) => boolean;
  checkModuleAction: (module: string, action: PermissionAction) => boolean;
  checkRole: (role: UserRole) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<AuthSession | null>(null);

  const hydrate = useCallback(() => {
    const restored = authService.restoreSession();
    setSession(restored);
    setStatus(restored ? "authenticated" : "unauthenticated");
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(hydrate);
    return () => window.cancelAnimationFrame(frame);
  }, [hydrate]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setStatus("loading");
    const result = await authService.login(credentials);

    if ("error" in result) {
      setStatus("unauthenticated");
      return { success: false as const, error: result.error };
    }

    setSession(result.session);
    setStatus("authenticated");
    return { success: true as const };
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
    setStatus("unauthenticated");
  }, []);

  const refreshSession = useCallback(async () => {
    const updated = await authService.refreshTokens();
    if (updated) {
      setSession(updated);
      setStatus("authenticated");
    } else {
      hydrate();
    }
  }, [hydrate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      isAuthenticated: status === "authenticated" && Boolean(session),
      isLoading: status === "loading",
      login,
      logout,
      refreshSession,
      checkPermission: (permission) => hasPermission(session, permission),
      checkModuleAction: (module, action) => {
        if (!session) return false;
        return userCan(session.user.permissions, module, action);
      },
      checkRole: (role) => hasRole(session, role),
    }),
    [status, session, login, logout, refreshSession]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
