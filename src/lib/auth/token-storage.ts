import { AUTH_STORAGE_KEYS } from "./constants";
import type { TokenPair } from "./types";

type StorageBackend = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function getBackend(persistent: boolean): StorageBackend | null {
  if (typeof window === "undefined") return null;
  return persistent ? localStorage : sessionStorage;
}

/**
 * Token storage abstraction — swap implementation when JWT backend is connected.
 * Supports separate access/refresh keys and a combined token pair payload.
 */
export const tokenStorage = {
  save(tokens: TokenPair, persistent: boolean): void {
    const storage = getBackend(persistent);
    if (!storage) return;

    storage.setItem(AUTH_STORAGE_KEYS.accessToken, tokens.accessToken);
    if (tokens.refreshToken) {
      storage.setItem(AUTH_STORAGE_KEYS.refreshToken, tokens.refreshToken);
    }

    const fallback = getBackend(!persistent);
    fallback?.removeItem(AUTH_STORAGE_KEYS.accessToken);
    fallback?.removeItem(AUTH_STORAGE_KEYS.refreshToken);
  },

  load(persistent: boolean): TokenPair | null {
    const storage = getBackend(persistent);
    if (!storage) return null;

    const accessToken = storage.getItem(AUTH_STORAGE_KEYS.accessToken);
    if (!accessToken) return null;

    const refreshToken =
      storage.getItem(AUTH_STORAGE_KEYS.refreshToken) ?? undefined;

    return { accessToken, refreshToken, tokenType: "Bearer" };
  },

  clear(): void {
    if (typeof window === "undefined") return;

    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem(AUTH_STORAGE_KEYS.accessToken);
      storage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
    }
  },

  isExpired(expiresAt?: number): boolean {
    if (!expiresAt) return false;
    return Date.now() >= expiresAt;
  },
};
