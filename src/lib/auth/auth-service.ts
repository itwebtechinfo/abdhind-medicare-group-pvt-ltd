import type { AxiosError } from "axios";
import { AUTH_ROUTES } from "./constants";
import { sessionStorageLayer } from "./session-storage";
import { tokenStorage } from "./token-storage";
import { getDashboardPathForRole, ROLE_LABELS } from "@/src/lib/rbac/roles";
import { http, publicHttp } from "@/src/services/http";
import { normalizeApiError } from "@/src/services/api-client";
import { API_ENDPOINTS } from "@/src/config/endpoints";
import type { ApiUser } from "@/src/features/users/user";
import type {
  AuthError,
  AuthSession,
  AuthUser,
  LoginCredentials,
  Permission,
  TokenPair,
  UserRole,
} from "./types";

interface ApiTokens {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
}

export interface PatientSignupPayload {
  phone_number: string;
  password: string;
  full_name: string;
  otp: string;
  state: string;
  district: string;
  email?: string;
  age?: number;
  gender?: string;
  address?: string;
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
    profileImage: raw.profile_image,
    age: raw.age,
    gender: raw.gender,
    state: raw.state,
    district: raw.district,
    address: raw.address,
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
      const envelope = await publicHttp.post<{ user: ApiUser; tokens: ApiTokens }>(
        API_ENDPOINTS.auth.login,
        {
          phone_number: credentials.phone.trim(),
          password: credentials.password,
        }
      );

      const { user, tokens } = envelope.data;
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

  /**
   * Public self-signup (patients only) — creates the account only. Doesn't
   * persist a session; the patient logs in afterwards with their new
   * credentials via the regular `login()` flow.
   */
  async signup(payload: PatientSignupPayload): Promise<{ success: true } | { error: AuthError }> {
    try {
      await publicHttp.post<{ user: ApiUser; tokens: ApiTokens }>(
        API_ENDPOINTS.patients.signup,
        payload
      );
      return { success: true };
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
      const envelope = await http.get<{ user: ApiUser }>(API_ENDPOINTS.auth.me);
      // Re-read from storage instead of reusing `stored`: the request above
      // may have silently refreshed the access token via the response
      // interceptor, and persisting `stored`'s pre-call tokens here would
      // clobber that fresh token with the stale one.
      const latest = sessionStorageLayer.load() ?? stored;
      const session: AuthSession = {
        ...latest,
        user: mapApiUser(envelope.data.user),
      };
      this.persistSession(session);
      return session;
    } catch {
      this.clearSession();
      return null;
    }
  },

  /** User-initiated logout: best-effort server cleanup, then clear locally. */
  async logout(): Promise<void> {
    // Must await before clearing: the request interceptor reads the token
    // from storage as a microtask, so clearing synchronously right after
    // firing the request would race it and send the logout call without
    // an Authorization header.
    await http.post(API_ENDPOINTS.auth.logout).catch(() => {});
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
      const envelope = await publicHttp.post<ApiTokens>(API_ENDPOINTS.auth.refresh, {
        refresh_token: session.tokens.refreshToken,
      });

      const updated: AuthSession = {
        ...session,
        tokens: mapApiTokens(envelope.data, session.tokens.refreshToken),
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
