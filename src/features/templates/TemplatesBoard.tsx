"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Hourglass, Loader2, Plus, RefreshCw, Search, Send } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { usePermission } from "@/src/hooks/usePermission";
import { toast } from "@/src/lib/toast";
import { cn } from "@/src/lib/utils";
import type { NormalizedApiError } from "@/src/types/api";
import { APPT_UI } from "@/src/features/appointments/StatusBadge";
import { BlockError } from "@/src/features/dashboard/BlockCard";
import { CategoryBadge, LanguageChips, StatusPill } from "./TemplateBits";
import { draftFromVersion, TemplateDetailDrawer } from "./TemplateDetailDrawer";
import { TemplateFormDrawer, type FormSeed } from "./TemplateFormDrawer";
import {
  templateDetailKey,
  templatesService,
  TEMPLATES_OVERVIEW_KEY,
  TEMPLATES_PAGE_KEY,
  type TemplateRow,
} from "./templates";

type Tab = "all" | "needs_action" | "in_review" | "live";
const TABS: { key: Tab; label: string; match: (r: TemplateRow) => boolean }[] = [
  { key: "all", label: "All", match: () => true },
  { key: "needs_action", label: "Needs action", match: (r) => r.state === "ready" || r.state === "rejected" },
  { key: "in_review", label: "In review", match: (r) => r.state === "in_review" },
  { key: "live", label: "Live", match: (r) => Boolean(r.live) },
];
const HIDDEN_REASON = { test: "test", old: "old version", retired: "no longer sent", hidden: "hidden by admin" } as const;
const GRID = "md:grid md:grid-cols-[minmax(0,2.2fr)_110px_110px_minmax(0,1fr)_minmax(0,1.4fr)_90px_150px] md:items-center md:gap-4";

/** WhatsApp → Templates: one row per message, everything else in the drawer.
 * No polling: the section's activity watcher invalidates this data when Meta
 * approves/rejects something, and it refetches on focus at most every 2 min. */
export function TemplatesBoard() {
  const queryClient = useQueryClient();
  const { can } = usePermission();
  const canManage = can("whatsapp_inbox:broadcast");
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [form, setForm] = useState<{ open: boolean; seed?: FormSeed; n: number }>({ open: false, n: 0 });
  const [confirmRow, setConfirmRow] = useState<TemplateRow | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: TEMPLATES_OVERVIEW_KEY,
    queryFn: async () => (await templatesService.overview()).data,
    enabled: canManage,
    staleTime: 120_000,
    refetchOnWindowFocus: true,
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: TEMPLATES_PAGE_KEY });

  const rows = useMemo(() => data?.rows ?? [], [data]);
  const term = search.trim().toLowerCase();
  const visible = rows.filter(
    (r) => TABS.find((t) => t.key === tab)!.match(r) && (!term || r.name.toLowerCase().includes(term) || r.template.includes(term) || r.latest.name.includes(term))
  );

  const syncMutation = useMutation({
    mutationFn: () => templatesService.sync(),
    onSuccess: (res) => {
      toast.success("Synced with Meta", `${res.data.synced} template copies refreshed.`);
      invalidate();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error ?? "Sync failed", err.msg),
  });
  const switchMutation = useMutation({
    mutationFn: (r: TemplateRow) => templatesService.switchVersion(r.key, r.latest.name),
    onSuccess: (_res, r) => {
      toast.success(`Switched to ${r.latest.label}`, `New ${r.name.toLowerCase()} messages use ${r.latest.name}.`);
      setConfirmRow(null);
      invalidate();
    },
    onError: (err: NormalizedApiError) => {
      setConfirmRow(null);
      toast.error(err.error ?? "Couldn't switch", err.msg);
    },
  });

  const runAction = async (r: TemplateRow) => {
    if (r.action === "switch") return setConfirmRow(r);
    if (r.action === "view") return setOpenKey(r.key);
    setBusyKey(r.key);
    try {
      if (r.action === "submit") {
        const res = await templatesService.submitSystem([r.latest.name]);
        const failed = res.data.results.filter((x) => x.status === "SUBMIT_FAILED" || x.status === "INVALID");
        if (failed.length) toast.error("Some languages failed to submit", failed.map((f) => f.reason).join(" · "));
        else toast.success("Submitted to Meta", `${r.latest.name} — approval usually takes minutes to a day.`);
        invalidate();
      } else if (r.action === "fix") {
        const detail = await queryClient.fetchQuery({
          queryKey: templateDetailKey(r.key),
          queryFn: async () => (await templatesService.detail(r.key)).data,
          staleTime: 120_000,
        });
        const version = detail.versions.find((v) => v.name === r.latest.name) ?? detail.versions[detail.versions.length - 1];
        setForm((f) => ({ open: true, n: f.n + 1, seed: draftFromVersion(detail, version, detail.next_version_name ?? `${r.latest.name}_v2`) }));
      }
    } catch (err) {
      const e = err as NormalizedApiError;
      toast.error(e.error ?? "Something went wrong", e.msg);
    } finally {
      setBusyKey(null);
    }
  };

  if (!canManage) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="text-xl font-semibold">WhatsApp templates</h1>
        <p className="mt-2 text-sm text-muted-foreground">Only admins can manage WhatsApp templates.</p>
      </div>
    );
  }

  const cards = data?.cards;
  return (
    <div className="-m-4 min-h-full bg-[#F5F7F6] p-4 dark:bg-background sm:-m-5 sm:p-5 lg:-m-6 lg:p-6 xl:-m-8 xl:p-8">
      <div className="mx-auto w-full max-w-[1600px] space-y-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className={cn("text-3xl font-semibold tracking-tight", APPT_UI.ink)}>WhatsApp templates</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Messages the clinic sends to patients outside an open chat. Meta must approve each one.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2 bg-card shadow-none" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
              <RefreshCw className={cn("h-4 w-4", syncMutation.isPending && "animate-spin")} />
              Sync with Meta
            </Button>
            <Button className={cn("gap-2", APPT_UI.primaryButton)} onClick={() => setForm((f) => ({ open: true, n: f.n + 1, seed: undefined }))}>
              <Plus className="h-4 w-4" />
              New template
            </Button>
          </div>
        </header>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={CheckCircle2} tone="green" value={cards?.ready} label="approved & ready to switch" loading={isLoading} onClick={() => setTab("needs_action")} />
          <SummaryCard icon={Hourglass} tone="amber" value={cards?.in_review} label="waiting for Meta review" loading={isLoading} onClick={() => setTab("in_review")} />
          <SummaryCard icon={AlertCircle} tone="red" value={cards?.rejected} label="rejected — needs a fix" loading={isLoading} onClick={() => setTab("needs_action")} />
          <SummaryCard icon={Send} tone="blue" value={cards?.sent_30d} label="template messages sent (30 days)" loading={isLoading} />
        </div>

        {/* Tabs + search */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label="Filter templates" className={cn(APPT_UI.card, "flex w-fit flex-wrap gap-1 p-1")}>
            {TABS.map((t) => {
              const count = rows.filter(t.match).length;
              return (
                <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                        className={cn("flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm", tab === t.key ? "bg-[#17261F] font-semibold text-white dark:bg-foreground dark:text-background" : "hover:bg-muted")}>
                  {t.label}
                  <span className={cn("min-w-5 rounded-full px-1.5 text-center text-xs tabular-nums", tab === t.key ? "bg-white/20" : "bg-muted text-muted-foreground")}>{count}</span>
                </button>
              );
            })}
          </div>
          <div className="relative lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or template name"
                   aria-label="Search templates" className="h-9 bg-card pl-9 shadow-none" />
          </div>
        </div>

        {/* Table */}
        <section className={cn(APPT_UI.card, "overflow-hidden")}>
          <div className={cn("hidden border-b border-[#E3E9E5] bg-muted/30 px-5 py-3 text-xs font-medium text-muted-foreground dark:border-border", GRID)}>
            <span>Message</span><span>Type</span><span>Languages</span><span>Live now</span><span>Latest version</span>
            <span className="text-right">Sent (30d)</span><span className="text-right">Action</span>
          </div>
          {isLoading ? (
            Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="m-4 h-10" />)
          ) : isError ? (
            <BlockError onRetry={() => refetch()} />
          ) : visible.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              {term ? `No templates match “${search.trim()}”` : "Nothing here right now."}
            </p>
          ) : (
            visible.map((r) => (
              <div key={r.key} role="button" tabIndex={0} onClick={() => setOpenKey(r.key)}
                   onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setOpenKey(r.key); } }}
                   className={cn("flex cursor-pointer flex-col gap-2 border-b border-[#E3E9E5] px-4 py-3.5 text-sm transition-colors last:border-b-0 hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none dark:border-border md:px-5", GRID)}>
                <div className="min-w-0">
                  <p className={cn("truncate font-semibold", APPT_UI.ink)}>{r.name}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">{r.template}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:contents">
                  <span><CategoryBadge category={r.category} /></span>
                  <LanguageChips languages={r.languages} />
                  <span className="text-sm">
                    {r.live ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-500/15 dark:text-green-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-600" />{r.live.label === "Broadcast" ? "Broadcast" : `${r.live.label} live`}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Not live yet</span>
                    )}
                  </span>
                </div>
                <StatusPill row={r} />
                <span className="tabular-nums text-muted-foreground md:text-right">
                  <span className="md:hidden">Sent (30 days): </span>{r.sent_30d.toLocaleString("en-IN")}
                </span>
                <div className="md:text-right" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant={r.action === "view" ? "ghost" : r.action === "fix" ? "outline" : "default"}
                          className={cn("h-8", (r.action === "switch" || r.action === "submit") && APPT_UI.primaryButton)}
                          disabled={busyKey === r.key} onClick={() => runAction(r)}>
                    {busyKey === r.key && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {{ switch: `Switch to ${r.latest.label}`, fix: "Fix & resubmit", submit: "Submit to Meta", view: "View" }[r.action]}
                  </Button>
                </div>
              </div>
            ))
          )}

          {data && data.hidden.length > 0 && (
            <details className="border-t border-[#E3E9E5] px-4 py-3 text-sm dark:border-border md:px-5">
              <summary className="cursor-pointer text-muted-foreground">
                Test &amp; old templates ({data.hidden.length}) · {data.hidden.slice(0, 3).map((h) => h.name).join(", ")}
                {data.hidden.length > 3 ? "…" : ""} · hidden by default
              </summary>
              <ul className="mt-3 divide-y divide-border">
                {data.hidden.map((h) => (
                  <li key={`${h.row_key}:${h.name}`} className="flex flex-wrap items-center justify-between gap-3 py-2">
                    <button type="button" className="min-w-0 text-left hover:underline" onClick={() => setOpenKey(h.row_key)}>
                      <span className="font-mono text-xs">{h.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {h.reason_hidden === "old" ? `${h.row_name} ${h.label} · ` : ""}{HIDDEN_REASON[h.reason_hidden]}
                      </span>
                    </button>
                    <span className="flex items-center gap-3">
                      <CategoryBadge category={h.category} />
                      <span className="text-xs tabular-nums text-muted-foreground">{h.sent_30d} sent</span>
                      {h.reason_hidden === "hidden" && (
                        <Button size="sm" variant="ghost" className="h-7" onClick={async () => { await templatesService.setHidden(h.name, false); invalidate(); }}>
                          Show again
                        </Button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>

        {data && rows.some((r) => r.kind === "custom") && (
          <HideCustomHint rows={rows} onHide={async (name) => { await templatesService.setHidden(name, true); toast.success("Moved to Test & old"); invalidate(); }} />
        )}
      </div>

      <TemplateDetailDrawer rowKey={openKey} canManage={canManage} onClose={() => setOpenKey(null)}
                            onOpenForm={(seed) => { setOpenKey(null); setForm((f) => ({ open: true, n: f.n + 1, seed })); }} />
      <TemplateFormDrawer key={form.n} open={form.open} seed={form.seed}
                          messageTypes={rows.filter((r) => r.kind === "system").map((r) => ({ key: r.key, name: r.name }))}
                          onClose={() => setForm((f) => ({ ...f, open: false }))} />
      <ConfirmDialog
        open={Boolean(confirmRow)}
        onOpenChange={(open) => !open && !switchMutation.isPending && setConfirmRow(null)}
        title={confirmRow ? `Switch to ${confirmRow.latest.label}?` : ""}
        description={confirmRow
          ? `${confirmRow.name}: ${confirmRow.live ? `${confirmRow.live.name} (${confirmRow.live.label})` : "nothing"} → ${confirmRow.latest.name} (${confirmRow.latest.label}). New messages use ${confirmRow.latest.label}; nothing already sent is resent.`
          : undefined}
        confirmLabel={confirmRow ? `Switch to ${confirmRow.latest.label}` : "Switch"}
        isLoading={switchMutation.isPending}
        onConfirm={() => confirmRow && switchMutation.mutate(confirmRow)}
      />
    </div>
  );
}

function SummaryCard({ icon: Icon, tone, value, label, loading, onClick }: {
  icon: typeof Send;
  tone: "green" | "amber" | "red" | "blue";
  value: number | undefined;
  label: string;
  loading: boolean;
  onClick?: () => void;
}) {
  const toneClass = {
    green: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    red: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  }[tone];
  const Tag = onClick ? "button" : "div";
  return (
    <Tag type={onClick ? "button" : undefined} onClick={onClick}
         className={cn(APPT_UI.card, "flex items-center gap-3 p-4 text-left", onClick && "transition-colors hover:bg-muted/40")}>
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", toneClass)}><Icon className="h-5 w-5" /></span>
      {loading ? <Skeleton className="h-8 w-40" /> : (
        <span className="flex items-baseline gap-2">
          <span className={cn("text-2xl font-bold tabular-nums", APPT_UI.ink)}>{(value ?? 0).toLocaleString("en-IN")}</span>
          <span className="text-sm text-muted-foreground">{label}</span>
        </span>
      )}
    </Tag>
  );
}

/** Admin "Hide" for custom templates nobody uses (moves them to Test & old). */
function HideCustomHint({ rows, onHide }: { rows: TemplateRow[]; onHide: (name: string) => void }) {
  const unused = rows.filter((r) => r.kind === "custom" && r.sent_30d === 0);
  if (!unused.length) return null;
  return (
    <p className="text-xs text-muted-foreground">
      Custom templates with no sends in 30 days:{" "}
      {unused.map((r, i) => (
        <span key={r.key}>
          {i > 0 && ", "}
          <span className="font-mono">{r.template}</span>{" "}
          <button type="button" className="underline-offset-2 hover:underline" onClick={() => onHide(r.template)}>hide</button>
        </span>
      ))}
    </p>
  );
}
