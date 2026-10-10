import { cn } from "@/src/lib/utils";
import { CATEGORY_LABEL, LANGUAGE_CHIP, MAIN_LANGUAGES, reasonLabel, type TemplateRow } from "./templates";

const CATEGORY_CLASS: Record<string, string> = {
  UTILITY: "bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  MARKETING: "bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
  AUTHENTICATION: "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300",
};

export function CategoryBadge({ category }: { category: string | null }) {
  if (!category) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-semibold", CATEGORY_CLASS[category] ?? CATEGORY_CLASS.AUTHENTICATION)}>
      {CATEGORY_LABEL[category] ?? category}
    </span>
  );
}

/** HI / EN chips; a language the template doesn't have is greyed out. */
export function LanguageChips({ languages }: { languages: string[] }) {
  const all = [...new Set([...MAIN_LANGUAGES, ...languages.map((l) => (l === "en" ? "en_US" : l))])];
  return (
    <span className="flex gap-1">
      {all.map((l) => {
        const has = languages.includes(l) || (l === "en_US" && languages.includes("en"));
        return (
          <span
            key={l}
            title={has ? undefined : "Not available in this language"}
            className={cn(
              "rounded border px-1.5 py-0.5 text-[11px] font-semibold",
              has ? "border-border text-foreground" : "border-dashed border-border text-muted-foreground/50"
            )}
          >
            {LANGUAGE_CHIP[l] ?? l.toUpperCase()}
          </span>
        );
      })}
    </span>
  );
}

const STATE_META: Record<string, { label: string; className: string }> = {
  ready: { label: "Approved & ready", className: "bg-green-50 text-green-800 dark:bg-green-500/15 dark:text-green-300" },
  up_to_date: { label: "Up to date", className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300" },
  approved: { label: "Approved", className: "bg-green-50 text-green-800 dark:bg-green-500/15 dark:text-green-300" },
  in_review: { label: "In review", className: "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300" },
  not_submitted: { label: "Not submitted", className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300" },
  paused: { label: "Paused by Meta", className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300" },
};

/** "Latest version" cell: version + state pill (+ one-line rejection reason). */
export function StatusPill({ row }: { row: Pick<TemplateRow, "state" | "latest"> }) {
  const meta = STATE_META[row.state] ?? STATE_META.paused;
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="flex items-center gap-1.5">
        {row.state !== "up_to_date" && <span className="text-xs font-semibold text-muted-foreground">{row.latest.label}</span>}
        <span className={cn("inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium", meta.className)}>
          {meta.label}
        </span>
      </span>
      {row.state === "rejected" && row.latest.reason && (
        <span className="truncate text-xs text-red-700 dark:text-red-400" title={reasonLabel(row.latest.reason) ?? undefined}>
          {reasonLabel(row.latest.reason)}
        </span>
      )}
    </span>
  );
}
