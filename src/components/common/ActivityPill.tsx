"use client";

import { Loader2 } from "lucide-react";
import { useLoader } from "@/src/hooks/useLoader";
import { cn } from "@/src/lib/utils";

/**
 * Background API activity indicator — reacts to `isRequestActive` only, kept
 * separate from TopProgressBar's `isNavigating` on purpose: a route change
 * and a fetch behind the scenes are different events and shouldn't share one
 * visual. Bottom-left (FloatingButtons already owns bottom-right, see
 * src/components/FloatingButtons.tsx). Light glass treatment — background
 * blur + a thin border, not a heavy frosted panel — so it reads as a status
 * chip, not a takeover.
 */
export function ActivityPill() {
  const { isRequestActive } = useLoader();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!isRequestActive}
      className={cn(
        "pointer-events-none fixed bottom-6 left-5 z-[95] transition-all duration-200 ease-out sm:left-6",
        isRequestActive ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      )}
    >
      <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg backdrop-blur-md">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" aria-hidden="true" />
        Syncing…
      </div>
    </div>
  );
}
