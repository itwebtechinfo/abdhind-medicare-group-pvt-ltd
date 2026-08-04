"use client";

import { useAppSelector } from "@/src/lib/store";
import { selectIsLoading, selectIsNavigating, selectIsRequestActive } from "@/src/lib/loaderSlice";
import { loaderController } from "@/src/lib/loader/loader-controller";

/**
 * Global loading state. API calls (axios) and route transitions already
 * feed this automatically — reach for `show`/`hide`/`withLoader` only for
 * work the global wiring can't see (e.g. a client-side-only computation
 * with no network call behind it).
 *
 * `isNavigating` (route transitions) and `isRequestActive` (API calls) are
 * exposed separately by design — TopProgressBar and ActivityPill each react
 * to only one, so a page transition and a background fetch read as two
 * distinct signals instead of one generic "something's happening" blur.
 * `isLoading` is the OR of both, for callers that just want either.
 */
export function useLoader() {
  const isLoading = useAppSelector(selectIsLoading);
  const isNavigating = useAppSelector(selectIsNavigating);
  const isRequestActive = useAppSelector(selectIsRequestActive);

  return {
    isLoading,
    isNavigating,
    isRequestActive,
    show: loaderController.requestStart,
    hide: loaderController.requestEnd,
    /** Wrap any async function so the global loader tracks it. */
    withLoader: async <T>(fn: () => Promise<T>): Promise<T> => {
      loaderController.requestStart();
      try {
        return await fn();
      } finally {
        loaderController.requestEnd();
      }
    },
  };
}
