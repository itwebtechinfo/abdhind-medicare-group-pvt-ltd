export type UserRole =
  | "system_admin"
  | "admin"
  | "account"
  | "doctor"
  | "reception"
  | "patient"
  | "pharmacy"
  | "lab";

export type PermissionAction = "view" | "create" | "edit" | "delete" | "manage";

/** Matches the backend's documented permission module list exactly. */
export type PermissionModule =
  | "dashboard"
  | "appointments"
  | "patients"
  | "doctors"
  | "reports"
  | "billing"
  | "settings"
  | "admin"
  | "pharmacy"
  | "lab"
  | "enquiry";

export type Permission = `${PermissionModule}:${PermissionAction}`;

export interface AuthUser {
  id: string;
  phone: string;
  displayName: string;
  email?: string;
  role: UserRole;
  permissions: Permission[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
  /** Unix timestamp (ms) when access token expires */
  expiresAt?: number;
  tokenType?: "Bearer";
}

export interface AuthSession {
  user: AuthUser;
  tokens: TokenPair;
  rememberMe: boolean;
  loggedInAt: number;
}

export interface LoginCredentials {
  phone: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthError {
  /** Backend's `error` field (e.g. "Unauthorized") — free-form, not a fixed set */
  code: string;
  message: string;
}

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";
