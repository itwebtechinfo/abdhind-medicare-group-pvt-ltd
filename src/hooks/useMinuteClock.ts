"use client";

import { useSyncExternalStore } from "react";

function subscribe(onTick: () => void) {
  const id = window.setInterval(onTick, 15_000);
  return () => window.clearInterval(id);
}

/** Epoch-ms floored to the minute (so consumers re-render once a minute,
 * not every poll), or `null` during SSR/hydration — "now" must never be
 * baked into server HTML or it would mismatch on the client. */
export function useMinuteClock(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / 60_000) * 60_000,
    () => null
  );
}
