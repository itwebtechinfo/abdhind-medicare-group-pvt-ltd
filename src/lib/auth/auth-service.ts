import type { AxiosError } from "axios";
import { AUTH_ROUTES } from "./constants";
import { sessionStorageLayer } from "./session-storage";
import { tokenStorage } from "./token-storage";
import { getDashboardPathForRole, ROLE_LABELS } from "@/src/lib/rbac/roles";
import { apiClient, publicApiClient, normalizeApiError } from "@/src/services/api-client";
import type { ApiEnvelope } from "@/src/types/api";
import type {
  AuthError,
  AuthSession,
  AuthUser,
  LoginCredentials,
  Permission,
  TokenPair,
  UserRole,
} from "./types";

interface ApiUser {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  role: string;
  permissions: string[];
}

interface ApiTokens {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
}

function mapApiUser(raw: ApiUser): AuthUser {
  return {
    id: raw.id,
    phone: raw.phone_number,
    displayName: raw.full_name,
    email: raw.email,
    // Backend role casing has been inconsistent (e.g. "ADMIN" vs the documented
    // "admin") — normalize defensively rather than trust exact casing.
    role: raw.role.toLowerCase() as UserRole,
    permissions: (raw.permissions ?? []) as Permission[],
  };
}

function mapApiTokens(raw: ApiTokens, previousRefreshToken?: string): TokenPair {
  return {
    accessToken: raw.access_token,
    // /auth/refresh doesn't return a new refresh_token (not rotated) — keep the one we have.
    refreshToken: raw.refresh_token ?? previousRefreshToken,
    expiresAt: Date.now() + (raw.expires_in ?? 1800) * 1000,
    tokenType: "Bearer",
  };
}

function toAuthError(err: unknown): AuthError {
  const normalized = normalizeApiError(err as AxiosError);
  return { code: normalized.error, message: normalized.msg };
}

/**
 * Auth service — talks to the real backend (FastAPI, phone+password login).
 */
export const authService = {
  async login(
    credentials: LoginCredentials
  ): Promise<{ session: AuthSession } | { error: AuthError }> {
    try {
      const response = await publicApiClient.post<
        ApiEnvelope<{ user: ApiUser; tokens: ApiTokens }>
      >("/api/v1/auth/login", {
        phone_number: credentials.phone.trim(),
        password: credentials.password,
      });

      const { user, tokens } = response.data.data;
      const session: AuthSession = {
        user: mapApiUser(user),
        tokens: mapApiTokens(tokens),
        rememberMe: Boolean(credentials.rememberMe),
        loggedInAt: Date.now(),
      };

      this.persistSession(session);
      return { session };
    } catch (err) {
      return { error: toAuthError(err) };
    }
  },

  persistSession(session: AuthSession): void {
    sessionStorageLayer.save(session);
    tokenStorage.save(session.tokens, session.rememberMe);
  },

  /** Re-validates the stored token against the server and refreshes user/permissions. */
  async restoreSession(): Promise<AuthSession | null> {
    const stored = sessionStorageLayer.load();
    if (!stored) return null;

    try {
      const response = await apiClient.get<ApiEnvelope<{ user: ApiUser }>>(
        "/api/v1/auth/me"
      );
      // Re-read from storage instead of reusing `stored`: the request above
      // may have silently refreshed the access token via the response
      // interceptor, and persisting `stored`'s pre-call tokens here would
      // clobber that fresh token with the stale one.
      const latest = sessionStorageLayer.load() ?? stored;
      const session: AuthSession = {
        ...latest,
        user: mapApiUser(response.data.data.user),
      };
      this.persistSession(session);
      return session;
    } catch {
      this.clearSession();
      return null;
    }
  },

  /** User-initiated logout: best-effort server cleanup, then clear locally. */
  logout(): void {
    apiClient.post("/api/v1/auth/logout").catch(() => {});
    this.clearSession();
  },

  /** Local-only session clear — no network call. Safe to call from the
   * 401-retry interceptor without risking recursion. */
  clearSession(): void {
    sessionStorageLayer.clear();
    tokenStorage.clear();
  },

  getAccessToken(): string | null {
    const session = sessionStorageLayer.load();
    if (!session) return null;
    if (tokenStorage.isExpired(session.tokens.expiresAt)) {
      return null;
    }
    return session.tokens.accessToken;
  },

  async refreshTokens(): Promise<AuthSession | null> {
    const session = sessionStorageLayer.load();
    if (!session?.tokens.refreshToken) return null;

    try {
      const response = await publicApiClient.post<ApiEnvelope<ApiTokens>>(
        "/api/v1/auth/refresh",
        { refresh_token: session.tokens.refreshToken }
      );

      const updated: AuthSession = {
        ...session,
        tokens: mapApiTokens(response.data.data, session.tokens.refreshToken),
      };
      this.persistSession(updated);
      return updated;
    } catch {
      return null;
    }
  },

  getLoginRedirect(session: AuthSession | null): string {
    if (!session) return AUTH_ROUTES.login;
    return getDashboardPathForRole(session.user.role);
  },

  getRoleLabel(role: UserRole): string {
    return ROLE_LABELS[role];
  },
};
