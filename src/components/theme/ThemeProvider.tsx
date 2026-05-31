"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { AUTH_STORAGE_KEYS, isErpPath } from "@/src/lib/auth/constants";

function hasUsableStoredSession(): boolean {
  if (typeof window === "undefined") return false;

  const rawSession =
    localStorage.getItem(AUTH_STORAGE_KEYS.session) ??
    sessionStorage.getItem(AUTH_STORAGE_KEYS.session);

  if (!rawSession) return false;

  try {
    const session = JSON.parse(rawSession) as {
      tokens?: { expiresAt?: number };
    };
    return !session.tokens?.expiresAt || Date.now() < session.tokens.expiresAt;
  } catch {
    return false;
  }
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const dashboardThemeEnabled =
    isErpPath(pathname) &&
    (isAuthenticated || (isLoading && hasUsableStoredSession()));

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      forcedTheme={dashboardThemeEnabled ? undefined : "light"}
      storageKey={AUTH_STORAGE_KEYS.theme}
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
