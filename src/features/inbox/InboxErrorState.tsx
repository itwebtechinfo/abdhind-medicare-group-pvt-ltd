"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, RotateCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

/** "Couldn't load …" card with a Retry button - shown instead of an endless skeleton. */
export function InboxErrorState({
  title,
  detail,
  onRetry,
  compact,
  testId,
}: {
  title: string;
  detail?: string | null;
  onRetry: () => unknown;
  compact?: boolean;
  testId?: string;
}) {
  const [retrying, setRetrying] = useState(false);
  return (
    <div
      role="alert"
      data-testid={testId}
      className={cn("flex flex-col items-center justify-center gap-2 text-center", compact ? "p-3" : "h-full p-6")}
    >
      <div className={cn("flex items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300", compact ? "h-8 w-8" : "h-11 w-11")}>
        <AlertTriangle className={compact ? "h-4 w-4" : "h-5 w-5"} />
      </div>
      <p className={cn("font-semibold text-[#17261F] dark:text-foreground", compact && "text-sm")}>{title}</p>
      {detail && <p className="max-w-xs text-sm text-muted-foreground">{detail}</p>}
      <Button
        variant="outline"
        size="sm"
        disabled={retrying}
        onClick={async () => {
          setRetrying(true);
          try {
            await onRetry();
          } finally {
            setRetrying(false);
          }
        }}
      >
        {retrying ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <RotateCw className="mr-1.5 h-4 w-4" />}
        Retry
      </Button>
    </div>
  );
}
