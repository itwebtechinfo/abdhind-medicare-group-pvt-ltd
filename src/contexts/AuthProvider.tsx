"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService, type PatientSignupPayload } from "@/src/lib/auth/auth-service";
import { authEvents } from "@/src/lib/auth/auth-events";
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
  /** Public self-signup (patients only) — creates the account and logs in immediately. */
  signup: (
    payload: PatientSignupPayload
  ) => Promise<{ success: true } | { success: false; error: AuthError }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  checkPermission: (permission: Permission) => boolean;
  checkModuleAction: (module: string, action: PermissionAction) => boolean;
  checkRole: (role: UserRole) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<AuthSession | null>(null);

  const hydrate = useCallback(async () => {
    const restored = await authService.restoreSession();
    setSession(restored);
    setStatus(restored ? "authenticated" : "unauthenticated");
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // The axios layer clears storage on a dead refresh token, but that alone
  // doesn't update this component's state — without this, a stale
  // `session` would keep passing route guards until a hard reload.
  useEffect(() => {
    return authEvents.onSessionEnded(() => {
      setSession(null);
      setStatus("unauthenticated");
    });
  }, []);

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

  // Doesn't authenticate — just creates the account. The patient logs in
  // afterwards with their new credentials via the regular `login` flow.
  const signup = useCallback(async (payload: PatientSignupPayload) => {
    const result = await authService.signup(payload);
    if ("error" in result) {
      return { success: false as const, error: result.error };
    }
    return { success: true as const };
  }, []);

  // "loggingOut" first (treated as a loading state by consumers) so any
  // mounted ProtectedRoute shows its loader instead of flashing the
  // "unauthenticated" fallback while the server call + storage clear are
  // still in flight. Awaiting authService.logout() (instead of firing it
  // and forgetting) means session/storage are actually cleared before we
  // flip to "unauthenticated" and route guards act on it.
  const logout = useCallback(async () => {
    setStatus("loggingOut");
    await authService.logout();
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
      isLoading: status === "loading" || status === "loggingOut",
      login,
      signup,
      logout,
      refreshSession,
      checkPermission: (permission) => hasPermission(session, permission),
      checkModuleAction: (module, action) => {
        if (!session) return false;
        return userCan(session.user.permissions, module, action);
      },
      checkRole: (role) => hasRole(session, role),
    }),
    [status, session, login, signup, logout, refreshSession]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
