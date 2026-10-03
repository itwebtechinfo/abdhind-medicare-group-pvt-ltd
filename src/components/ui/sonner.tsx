"use client";

import { useSyncExternalStore } from "react";
import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

// The Toaster lives in the root layout so a toast survives a route-group
// switch (e.g. "Session expired" while redirecting to /login). Theme providers
// are per route group, so read the applied theme from <html> instead.
function subscribeHtmlClass(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const htmlTheme = (): "dark" | "light" => (document.documentElement.classList.contains("dark") ? "dark" : "light");

export function Toaster(props: ToasterProps) {
  const theme = useSyncExternalStore(subscribeHtmlClass, htmlTheme, () => "light" as const);

  return (
    <SonnerToaster
      theme={theme}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "rounded-xl border font-sans shadow-lg",
          success:
            "!bg-emerald-50 !text-emerald-900 !border-emerald-200 dark:!bg-emerald-950 dark:!text-emerald-100 dark:!border-emerald-900",
          error:
            "!bg-red-50 !text-red-900 !border-red-200 dark:!bg-red-950 dark:!text-red-100 dark:!border-red-900",
          warning:
            "!bg-amber-50 !text-amber-900 !border-amber-200 dark:!bg-amber-950 dark:!text-amber-100 dark:!border-amber-900",
          info: "!bg-sky-50 !text-sky-900 !border-sky-200 dark:!bg-sky-950 dark:!text-sky-100 dark:!border-sky-900",
        },
      }}
      {...props}
    />
  );
}
