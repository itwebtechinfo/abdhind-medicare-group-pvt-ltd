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

export type Permission =
  | "dashboard:view"
  | "appointments:view"
  | "appointments:create"
  | "appointments:edit"
  | "appointments:delete"
  | "appointments:manage"
  | "patients:view"
  | "patients:create"
  | "patients:edit"
  | "patients:delete"
  | "patients:manage"
  | "doctors:view"
  | "doctors:create"
  | "doctors:edit"
  | "doctors:delete"
  | "doctors:manage"
  | "reports:view"
  | "reports:create"
  | "reports:edit"
  | "billing:view"
  | "billing:create"
  | "billing:edit"
  | "settings:view"
  | "settings:manage"
  | "admin:view"
  | "admin:manage"
  | "pharmacy:view"
  | "pharmacy:manage"
  | "lab:view"
  | "lab:manage"
  | "enquiry:view"
  | "enquiry:manage";

export interface AuthUser {
  id: string;
  username: string;
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
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthError {
  code: "INVALID_CREDENTIALS" | "SESSION_EXPIRED" | "UNAUTHORIZED" | "UNKNOWN";
  message: string;
}

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";
