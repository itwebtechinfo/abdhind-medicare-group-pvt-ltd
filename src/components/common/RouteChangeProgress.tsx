"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { loaderController } from "@/src/lib/loader/loader-controller";

/**
 * App Router doesn't expose router-level navigation-start/end events (unlike
 * the old Pages Router's `router.events`), so this hooks the one thing every
 * `router.push`/`router.replace`/`<Link>` click ultimately goes through: the
 * History API. `usePathname`/`useSearchParams` changing back in the
 * component below is what marks a navigation as settled.
 */
let historyPatched = false;
let navTimeout: ReturnType<typeof setTimeout> | null = null;

/** Guard against a pushState firing but the route never actually settling
 * (e.g. a shallow/no-op history call) — keeps the bar from spinning forever. */
const NAV_STUCK_TIMEOUT_MS = 8000;

function beginNavigation() {
  loaderController.navigationStart();
  if (navTimeout) clearTimeout(navTimeout);
  navTimeout = setTimeout(() => {
    navTimeout = null;
    loaderController.navigationEnd();
  }, NAV_STUCK_TIMEOUT_MS);
}

function endNavigation() {
  if (navTimeout) {
    clearTimeout(navTimeout);
    navTimeout = null;
  }
  loaderController.navigationEnd();
}

function patchHistory() {
  if (historyPatched || typeof window === "undefined") return;
  historyPatched = true;

  const wrap = (original: History["pushState"] | History["replaceState"]) =>
    function (this: History, data: unknown, unused: string, url?: string | URL | null) {
      if (url) {
        const target = new URL(url, window.location.href);
        if (target.pathname !== window.location.pathname || target.search !== window.location.search) {
          beginNavigation();
        }
      }
      return original.call(this, data, unused, url);
    } as History["pushState"];

  window.history.pushState = wrap(window.history.pushState.bind(window.history));
  window.history.replaceState = wrap(window.history.replaceState.bind(window.history));
}

/** Mount once near the root — has no visual output of its own, drives the loader. */
export function RouteChangeProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    patchHistory();
    window.addEventListener("popstate", beginNavigation);
    return () => window.removeEventListener("popstate", beginNavigation);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    endNavigation();
  }, [pathname, searchParams]);

  return null;
}
