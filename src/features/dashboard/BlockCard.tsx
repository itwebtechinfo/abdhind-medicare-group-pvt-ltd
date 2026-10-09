"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, BarChart3, RotateCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";
import { APPT_UI } from "@/src/features/appointments/StatusBadge";

export type BlockState = "loading" | "error" | "empty" | "ready";

interface BlockCardProps {
  title?: string;
  /** Right side of the header, e.g. "1,530 appointments" or a legend. */
  aside?: ReactNode;
  state: BlockState;
  onRetry?: () => void;
  /** Skeleton height while loading. */
  skeletonClassName?: string;
  className?: string;
  children?: ReactNode;
}

/** One dashboard block: its own skeleton, empty and error state, so one
 * failing block never breaks the rest of the page. */
export function BlockCard({ title, aside, state, onRetry, skeletonClassName, className, children }: BlockCardProps) {
  return (
    <section className={cn(APPT_UI.card, "flex min-w-0 flex-col p-4 sm:p-5", className)}>
      {(title || aside) && (
        <header className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          {title && <h2 className={cn("text-base font-semibold", APPT_UI.ink)}>{title}</h2>}
          {aside && state === "ready" && <div className="text-sm text-muted-foreground">{aside}</div>}
        </header>
      )}
      <BlockBoundary onRetry={onRetry}>
        {state === "loading" ? (
          <Skeleton className={cn("h-40 w-full", skeletonClassName)} />
        ) : state === "error" ? (
          <BlockError onRetry={onRetry} />
        ) : state === "empty" ? (
          <BlockEmpty />
        ) : (
          children
        )}
      </BlockBoundary>
    </section>
  );
}

export function BlockEmpty({ text = "No data for this period" }: { text?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center text-sm text-muted-foreground">
      <BarChart3 className="h-7 w-7 opacity-50" aria-hidden />
      {text}
    </div>
  );
}

export function BlockError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center text-sm">
      <AlertTriangle className="h-6 w-6 text-amber-600" aria-hidden />
      <p className="text-muted-foreground">Couldn&apos;t load this block.</p>
      {onRetry && (
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onRetry}>
          <RotateCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}

/** Catches a render error inside one block (e.g. an unexpected payload). */
export class BlockBoundary extends Component<{ children: ReactNode; onRetry?: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <BlockError
          onRetry={() => {
            this.setState({ failed: false });
            this.props.onRetry?.();
          }}
        />
      );
    }
    return this.props.children;
  }
}
