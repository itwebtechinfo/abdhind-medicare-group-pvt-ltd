"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AUTH_STORAGE_KEYS } from "@/src/lib/auth/constants";

/**
 * One provider at the root, so next-themes renders its pre-paint script once
 * (server-side) and never re-mounts on navigation between route groups.
 * The theme follows the ROUTE GROUP of the current page — not a pathname
 * list: useSelectedLayoutSegments() includes route groups ("(erp)") and is
 * known during server render too, so the right theme is applied before paint.
 *   (erp)  -> the user's saved light/dark preference
 *   (site), (auth), root 404 -> always light
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const erp = segments[0] === "(erp)";
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey={AUTH_STORAGE_KEYS.theme}
      disableTransitionOnChange={false}
      {...(erp ? {} : { forcedTheme: "light" })}
    >
      {children}
    </NextThemesProvider>
  );
}
