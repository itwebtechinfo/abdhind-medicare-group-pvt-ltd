import {
  ACCESS_TOKEN_TTL_MS,
  AUTH_ROUTES,
  MOCK_ROLE_CREDENTIALS,
  REMEMBERED_ACCESS_TOKEN_TTL_MS,
} from "./constants";
import { sessionStorageLayer } from "./session-storage";
import { tokenStorage } from "./token-storage";
import { ROLE_PERMISSIONS } from "@/src/lib/rbac/permissions";
import { getDashboardPathForRole } from "@/src/lib/rbac/roles";
import { ROLE_LABELS } from "@/src/lib/rbac/roles";
import type {
  AuthError,
  AuthSession,
  LoginCredentials,
  TokenPair,
  UserRole,
} from "./types";

function createMockTokens(rememberMe = false): TokenPair {
  const now = Date.now();
  const ttl = rememberMe ? REMEMBERED_ACCESS_TOKEN_TTL_MS : ACCESS_TOKEN_TTL_MS;
  return {
    accessToken: `mock_access_${now}`,
    refreshToken: `mock_refresh_${now}`,
    expiresAt: now + ttl,
    tokenType: "Bearer",
  };
}

const DISPLAY_NAMES: Record<UserRole, string> = {
  system_admin: "System Administrator",
  admin: "Clinic Administrator",
  account: "Accounts Manager",
  doctor: "Dr. Consultant",
  reception: "Reception Desk",
  patient: "Patient Portal User",
  pharmacy: "Pharmacy Manager",
  lab: "Lab Technician",
};

function buildSession(role: UserRole, username: string, rememberMe: boolean): AuthSession {
  const tokens = createMockTokens(rememberMe);
  return {
    user: {
      id: `usr_${role}_001`,
      username,
      displayName: DISPLAY_NAMES[role],
      email: `${username}@abdhindmedicare.com`,
      role,
      permissions: ROLE_PERMISSIONS[role],
    },
    tokens,
    rememberMe,
    loggedInAt: Date.now(),
  };
}

function resolveRole(username: string, password: string): UserRole | null {
  const key = username.trim().toLowerCase();
  const entry = MOCK_ROLE_CREDENTIALS[key];
  if (!entry || entry.password !== password) return null;
  return entry.role;
}

/**
 * Auth service — frontend mock today; replace `login`/`refresh` with API calls later.
 */
export const authService = {
  async login(
    credentials: LoginCredentials
  ): Promise<{ session: AuthSession } | { error: AuthError }> {
    await new Promise((r) => setTimeout(r, 500));

    const username = credentials.username.trim();
    const password = credentials.password;
    const role = resolveRole(username, password);

    if (!role) {
      return {
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid username or password. Please try again.",
        },
      };
    }

    const session = buildSession(role, username.toLowerCase(), Boolean(credentials.rememberMe));
    this.persistSession(session);
    return { session };
  },

  persistSession(session: AuthSession): void {
    sessionStorageLayer.save(session);
    tokenStorage.save(session.tokens, session.rememberMe);
  },

  restoreSession(): AuthSession | null {
    const session = sessionStorageLayer.load();
    if (!session) return null;

    if (tokenStorage.isExpired(session.tokens.expiresAt)) {
      this.logout();
      return null;
    }

    const storedTokens = tokenStorage.load(session.rememberMe);
    const tokens = storedTokens
      ? { ...session.tokens, ...storedTokens }
      : session.tokens;

    const role = session.user.role;
    return {
      ...session,
      tokens,
      user: {
        ...session.user,
        permissions: ROLE_PERMISSIONS[role] ?? session.user.permissions,
      },
    };
  },

  logout(): void {
    sessionStorageLayer.clear();
    tokenStorage.clear();
  },

  getAccessToken(): string | null {
    const session = sessionStorageLayer.load();
    if (!session) return null;
    if (tokenStorage.isExpired(session.tokens.expiresAt)) {
      this.logout();
      return null;
    }
    return session.tokens.accessToken;
  },

  async refreshTokens(): Promise<AuthSession | null> {
    const session = sessionStorageLayer.load();
    if (!session?.tokens.refreshToken) return null;

    const refreshed = createMockTokens(session.rememberMe);
    const updated: AuthSession = {
      ...session,
      tokens: {
        ...refreshed,
        refreshToken: session.tokens.refreshToken,
      },
    };
    this.persistSession(updated);
    return updated;
  },

  getLoginRedirect(session: AuthSession | null): string {
    if (!session) return AUTH_ROUTES.login;
    return getDashboardPathForRole(session.user.role);
  },

  getRoleLabel(role: UserRole): string {
    return ROLE_LABELS[role];
  },
};
