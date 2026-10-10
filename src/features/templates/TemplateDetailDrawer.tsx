"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { Skeleton } from "@/src/components/ui/skeleton";
import { toast } from "@/src/lib/toast";
import { cn } from "@/src/lib/utils";
import type { NormalizedApiError } from "@/src/types/api";
import { APPT_UI } from "@/src/features/appointments/StatusBadge";
import { BlockError } from "@/src/features/dashboard/BlockCard";
import { PhonePreview } from "./PhonePreview";
import { CategoryBadge } from "./TemplateBits";
import {
  changeSummary,
  historyLabel,
  readableBody,
  LANGUAGE_LABEL,
  reasonLabel,
  templateDetailKey,
  templatesService,
  TEMPLATES_PAGE_KEY,
  type TemplateDetail,
  type TemplateDraft,
  type VersionDetail,
} from "./templates";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = (ms: number) => {
  const d = new Date(ms + 5.5 * 3_600_000); // IST
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]}`;
};

/** A draft for the New template form, from a version (Fix & resubmit / Duplicate). */
export function draftFromVersion(detail: TemplateDetail, version: VersionDetail, name: string): TemplateDraft & { rejectionReason: string | null } {
  const perLanguage: TemplateDraft["perLanguage"] = {};
  for (const [lang, l] of Object.entries(version.languages_detail)) {
    perLanguage[lang] = {
      header: l.content.header && l.content.header !== "[image]" ? l.content.header : "",
      body: l.content.body ?? "",
      footer: l.content.footer ?? "",
      samples: [...l.sample_values],
    };
  }
  const first = Object.values(version.languages_detail)[0];
  return {
    friendlyName: `${detail.info.name} ${name.match(/_v(\d+)$/)?.[0].replace("_", "") ?? ""}`.trim(),
    name,
    messageType: detail.info.message_type ?? "",
    category: version.category === "MARKETING" ? "MARKETING" : "UTILITY",
    languages: Object.keys(version.languages_detail),
    perLanguage,
    buttons: (first?.content.buttons ?? [])
      .filter((b) => b.type === "URL" || b.type === "QUICK_REPLY")
      .map((b) => ({ type: b.type as "URL" | "QUICK_REPLY", text: b.text, url: b.url ?? "" })),
    variableKeys: version.variables.map((v) => v.key ?? ""),
    rejectionReason: version.reason,
  };
}

interface Props {
  rowKey: string | null;
  canManage: boolean;
  onClose: () => void;
  onOpenForm: (draft: TemplateDraft & { rejectionReason?: string | null }) => void;
}

export function TemplateDetailDrawer({ rowKey, canManage, onClose, onOpenForm }: Props) {
  return (
    <DialogPrimitive.Root open={Boolean(rowKey)} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-card text-card-foreground shadow-2xl focus:outline-none sm:max-w-[780px] sm:border-l sm:border-[#E3E9E5] sm:dark:border-border"
        >
          {rowKey && <DrawerBody key={rowKey} rowKey={rowKey} canManage={canManage} onOpenForm={onOpenForm} />}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function DrawerBody({ rowKey, canManage, onOpenForm }: { rowKey: string; canManage: boolean; onOpenForm: Props["onOpenForm"] }) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: templateDetailKey(rowKey),
    queryFn: async () => (await templatesService.detail(rowKey)).data,
    staleTime: 120_000,
  });
  const [versionName, setVersionName] = useState<string | null>(null);
  const [lang, setLang] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const version = data ? data.versions.find((v) => v.name === versionName) ?? data.versions[data.versions.length - 1] : null;
  const live = data?.versions.find((v) => v.live) ?? null;
  const activeLang = version ? (lang && version.languages_detail[lang] ? lang : Object.keys(version.languages_detail)[0]) : null;
  const langDetail = version && activeLang ? version.languages_detail[activeLang] : null;
  const allApproved = version ? version.languages.every((l) => version.statuses[l] === "APPROVED") : false;
  const notApproved = version ? version.languages.filter((l) => version.statuses[l] !== "APPROVED") : [];

  // Compare with the live version (or, when viewing the live one, with the one before it).
  const versionIndex = data && version ? data.versions.findIndex((v) => v.name === version.name) : -1;
  const compareTo =
    !data || !version ? null : live && live.name !== version.name ? live : versionIndex > 0 ? data.versions[versionIndex - 1] : null;
  const changes =
    compareTo && activeLang && compareTo.languages_detail[activeLang]?.content.body && langDetail?.content.body
      ? changeSummary(
          readableBody(compareTo.languages_detail[activeLang].content.body as string, compareTo.variables, compareTo.languages_detail[activeLang].sample_values),
          readableBody(langDetail.content.body, version?.variables ?? [], langDetail.sample_values)
        )
      : [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: TEMPLATES_PAGE_KEY });
  const switchMutation = useMutation({
    mutationFn: () => templatesService.switchVersion(data?.info.message_type as string, version?.name as string),
    onSuccess: () => {
      toast.success(`Switched to ${version?.label}`, `New ${data?.info.name.toLowerCase()} messages use ${version?.name}.`);
      setConfirmOpen(false);
      invalidate();
    },
    onError: (err: NormalizedApiError) => {
      setConfirmOpen(false);
      toast.error(err.error ?? "Couldn't switch", err.msg);
    },
  });
  const submitMutation = useMutation({
    mutationFn: () => templatesService.submitSystem([version?.name as string]),
    onSuccess: (res) => {
      const failed = res.data.results.filter((r) => r.status === "SUBMIT_FAILED" || r.status === "INVALID");
      if (failed.length) toast.error("Some languages failed to submit", failed.map((f) => f.reason).join(" · "));
      else toast.success("Submitted to Meta", "Approval usually takes minutes to a day.");
      invalidate();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error ?? "Couldn't submit", err.msg),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <DialogPrimitive.Title className="sr-only">Loading template</DialogPrimitive.Title>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  if (isError || !data || !version || !langDetail || !activeLang) {
    return (
      <div className="p-6">
        <DialogPrimitive.Title className="sr-only">Template</DialogPrimitive.Title>
        <BlockError onRetry={() => refetch()} />
      </div>
    );
  }

  const isSystem = data.info.kind === "system";
  const history = mergeHistory(version);

  return (
    <>
      <header className="border-b border-[#E3E9E5] p-5 dark:border-border sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <CategoryBadge category={version.category} />
          <DialogPrimitive.Close className="-mr-1 -mt-1 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>
        <DialogPrimitive.Title className={cn("mt-2 text-2xl font-semibold tracking-tight", APPT_UI.ink)}>
          {data.info.name}
        </DialogPrimitive.Title>
        <p className="mt-1 text-sm text-muted-foreground">{data.info.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Toggle
            label="Version"
            options={data.versions.map((v) => ({
              value: v.name,
              label: `${v.label} · ${v.live ? "Live now" : stateLabel(v)}`,
            }))}
            value={version.name}
            onChange={setVersionName}
          />
          <Toggle
            label="Language"
            options={Object.keys(version.languages_detail).map((l) => ({ value: l, label: LANGUAGE_LABEL[l] ?? l }))}
            value={activeLang}
            onChange={setLang}
          />
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-5 sm:p-6 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <section>
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">What the patient will see</h3>
          <PhonePreview content={langDetail.content} sampleValues={langDetail.sample_values} clinicName={data.clinic_name} />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {statusLabelFor(langDetail.status)} · {LANGUAGE_LABEL[activeLang] ?? activeLang}
          </p>
        </section>

        <div className="space-y-6 text-sm">
          {langDetail.reason && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
              <p className="font-semibold">Meta rejected this</p>
              <p>{reasonLabel(langDetail.reason)}</p>
            </div>
          )}

          {version.variables.length > 0 && (
            <section>
              <h3 className="mb-2 font-semibold text-muted-foreground">Filled in automatically</h3>
              <ul className="space-y-1.5">
                {version.variables.map((v) => (
                  <li key={v.n} className="flex items-baseline gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{`{{${v.n}}}`}</code>
                    <span>{v.label}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {compareTo && (
            <section>
              <h3 className="mb-2 font-semibold text-muted-foreground">What changed from {compareTo.label}</h3>
              {changes.length === 0 ? (
                <p className="text-muted-foreground">Same text as {compareTo.label}.</p>
              ) : (
                <ul className="space-y-1">
                  {changes.slice(0, 10).map((c, i) => (
                    <li key={i}>
                      {c.removed && <span className="text-red-700 line-through dark:text-red-400">{c.removed}</span>}
                      {c.removed && c.added && <span className="mx-1 text-muted-foreground">→</span>}
                      {c.added && (
                        <span className="font-semibold text-green-700 dark:text-green-400">
                          {!c.removed && "+ "}
                          {c.added}
                        </span>
                      )}
                    </li>
                  ))}
                  {changes.length > 10 && <li className="text-muted-foreground">…and {changes.length - 10} more changes</li>}
                </ul>
              )}
            </section>
          )}

          <section>
            <h3 className="mb-2 font-semibold text-muted-foreground">Approval history</h3>
            {history.length === 0 ? (
              <p className="text-muted-foreground">Not submitted to Meta yet.</p>
            ) : (
              <ol className="relative space-y-3 border-l border-border pl-5">
                {history.map((h, i) => (
                  <li key={i}>
                    <span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full border-2 border-muted-foreground bg-card" aria-hidden />
                    <span className="font-semibold">{h.at ? day(h.at) : "Date unknown"}</span>
                    <span className="text-muted-foreground"> · {historyLabel(h.status)} ({h.languages.join(" + ")})</span>
                    {h.reason && <p className="text-red-700 dark:text-red-400">{reasonLabel(h.reason)}</p>}
                  </li>
                ))}
                {!version.live && live && (
                  <li>
                    <span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full border-2 border-muted-foreground bg-card" aria-hidden />
                    <span className="font-semibold">Now</span>
                    <span className="text-muted-foreground"> · Patients still get {live.label}</span>
                  </li>
                )}
              </ol>
            )}
          </section>
        </div>
      </div>

      {canManage && (
        <footer className="flex flex-col gap-3 border-t border-[#E3E9E5] p-4 dark:border-border sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-muted-foreground">
            {isSystem && !version.live
              ? `Switching is instant. New messages use ${version.label}; nothing already sent is resent.`
              : version.live
                ? "This version is live."
                : "Custom template — choose it in Broadcast."}
          </p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {data.next_version_name && (
              <Button variant="outline" onClick={() => onOpenForm(draftFromVersion(data, version, data.next_version_name as string))}>
                {version.state === "rejected" ? "Fix & resubmit" : "Duplicate as new"}
              </Button>
            )}
            {isSystem && version.state === "not_submitted" && (
              <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending} className={APPT_UI.primaryButton}>
                {submitMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit to Meta
              </Button>
            )}
            {isSystem && !version.live && version.state !== "not_submitted" && version.state !== "rejected" && (
              <span title={allApproved ? undefined : `${notApproved.map((l) => LANGUAGE_LABEL[l] ?? l).join(", ")} still ${statusLabelFor(version.statuses[notApproved[0]]).toLowerCase()}`}>
                <Button className={APPT_UI.primaryButton} disabled={!allApproved} onClick={() => setConfirmOpen(true)}>
                  Switch to {version.label}
                </Button>
              </span>
            )}
          </div>
        </footer>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => !switchMutation.isPending && setConfirmOpen(open)}
        title={`Switch to ${version.label}?`}
        description={`${data.info.name}: ${live ? `${live.name} (${live.label})` : "nothing"} → ${version.name} (${version.label}). New messages use ${version.label}; nothing already sent is resent.`}
        confirmLabel={`Switch to ${version.label}`}
        isLoading={switchMutation.isPending}
        onConfirm={() => switchMutation.mutate()}
      />
    </>
  );
}

function stateLabel(v: VersionDetail): string {
  return { approved: "Approved", rejected: "Rejected", in_review: "In review", not_submitted: "Not submitted", paused: "Paused" }[v.state];
}

function statusLabelFor(status: string): string {
  return historyLabel(status);
}

/** One line per step across languages ("Approved (Hinglish + English)"). */
function mergeHistory(version: VersionDetail) {
  const lines: { status: string; at: number | null; reason?: string | null; languages: string[] }[] = [];
  for (const [lang, l] of Object.entries(version.languages_detail)) {
    for (const h of l.history) {
      const same = lines.find(
        (x) => x.status === h.status && (x.at === null ? h.at === null : h.at !== null && Math.abs(x.at - h.at) < 86_400_000)
      );
      if (same) same.languages.push(LANGUAGE_LABEL[lang] ?? lang);
      else lines.push({ status: h.status, at: h.at, reason: h.reason, languages: [LANGUAGE_LABEL[lang] ?? lang] });
    }
  }
  // Dated steps in order; "date unknown" ones last.
  return lines.sort((a, b) => (a.at === null ? 1 : 0) - (b.at === null ? 1 : 0) || (a.at ?? 0) - (b.at ?? 0));
}

function Toggle({ label, options, value, onChange }: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-sm transition-colors",
            o.value === value
              ? "border-[#17261F] bg-[#17261F] font-semibold text-white dark:border-foreground dark:bg-foreground dark:text-background"
              : "border-border hover:bg-muted"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

