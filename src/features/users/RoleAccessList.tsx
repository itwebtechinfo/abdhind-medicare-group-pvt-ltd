import { Check, Eye, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { AccessLevel, RoleModuleAccess } from "./user";

const LEVEL_TEXT: Record<AccessLevel, string> = { full: "Full access", view_only: "View only", none: "No access" };

/** ✓ full · 👁 view only · ✕ none — straight from GET /roles. Placeholder
 * pages get a "coming soon" note instead of a normal tick. */
export function RoleAccessList({
  modules,
  compact = false,
  highlight,
}: {
  modules: RoleModuleAccess[];
  compact?: boolean;
  /** Keys to emphasise (e.g. what changes in a role switch). */
  highlight?: Set<string>;
}) {
  return (
    <ul className={cn("grid grid-cols-1 gap-x-6 sm:grid-cols-2", compact ? "text-xs" : "text-sm")}>
      {modules.map((m) => {
        const none = m.level === "none";
        return (
          <li
            key={m.key}
            title={`${m.label}: ${m.coming_soon && !none ? "page coming soon" : LEVEL_TEXT[m.level]}`}
            className={cn(
              "flex items-center gap-2 border-b border-dashed border-[#E3E9E5] dark:border-border",
              compact ? "py-1.5" : "py-2.5",
              highlight?.has(m.key) && "rounded bg-amber-50/70 px-1 dark:bg-amber-500/10"
            )}
          >
            {none ? (
              <X className="h-4 w-4 shrink-0 text-muted-foreground/60" aria-label="No access" />
            ) : m.level === "view_only" ? (
              <Eye className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" aria-label="View only" />
            ) : m.coming_soon ? (
              <Check className="h-4 w-4 shrink-0 text-muted-foreground/60" aria-label="Access granted, page coming soon" />
            ) : (
              <Check className="h-4 w-4 shrink-0 text-[#1F7A4A] dark:text-primary" aria-label="Full access" />
            )}
            <span className={cn("min-w-0 truncate", none ? "text-muted-foreground" : "text-foreground")}>{m.label}</span>
            {m.level === "view_only" && <span className="shrink-0 text-xs text-blue-700 dark:text-blue-300">view only</span>}
            {m.coming_soon && !none && (
              <span className="shrink-0 rounded bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">coming soon</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
