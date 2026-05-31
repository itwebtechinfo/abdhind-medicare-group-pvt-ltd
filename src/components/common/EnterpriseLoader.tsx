import Image from "next/image";
import { HeartPulse } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface EnterpriseLoaderProps {
  label?: string;
  sublabel?: string;
  className?: string;
  compact?: boolean;
}

export function EnterpriseLoader({
  label = "Loading workspace",
  sublabel = "Preparing a secure healthcare experience",
  className,
  compact = false,
}: EnterpriseLoaderProps) {
  return (
    <div
      className={cn(
        "flex min-h-[48vh] items-center justify-center px-4 text-center",
        compact && "min-h-0 py-8",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
          <span className="absolute inset-0 rounded-2xl bg-primary/10 animate-ping" />
          <Image
            src="/logo.png"
            alt="Abd Hind MediCare"
            width={42}
            height={42}
            className="relative z-10 object-contain"
            priority={compact}
          />
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
            <HeartPulse className="h-4 w-4 animate-pulse" />
            {label}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{sublabel}</p>
        </div>
        <div className="h-1.5 w-44 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-[loader-slide_1.2s_ease-in-out_infinite] rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
