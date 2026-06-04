import { AUTH_STORAGE_KEYS } from "./constants";
import type { AuthSession } from "./types";

function getStorage(persistent: boolean): Storage | null {
  if (typeof window === "undefined") return null;
  return persistent ? localStorage : sessionStorage;
}

function readRememberFlag(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_STORAGE_KEYS.remember) === "true";
}

export const sessionStorageLayer = {
  save(session: AuthSession): void {
    const persistent = session.rememberMe;
    const storage = getStorage(persistent);
    if (!storage) return;

    storage.setItem(AUTH_STORAGE_KEYS.session, JSON.stringify(session));
    getStorage(!persistent)?.removeItem(AUTH_STORAGE_KEYS.session);

    if (persistent) {
      localStorage.setItem(AUTH_STORAGE_KEYS.remember, "true");
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.remember);
    }
  },

  load(): AuthSession | null {
    if (typeof window === "undefined") return null;

    const persistent = readRememberFlag();
    const primary = getStorage(persistent);
    const fallback = getStorage(!persistent);

    const raw =
      primary?.getItem(AUTH_STORAGE_KEYS.session) ??
      fallback?.getItem(AUTH_STORAGE_KEYS.session);

    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  },

  clear(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem(AUTH_STORAGE_KEYS.session);
    localStorage.removeItem(AUTH_STORAGE_KEYS.remember);
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.session);
  },

  getRememberMe(): boolean {
    return readRememberFlag();
  },
};
