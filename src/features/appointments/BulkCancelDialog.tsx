"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Textarea } from "@/src/components/ui/textarea";
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";
import {
  appointmentService,
  type BulkCancelFilter,
  type BulkCancelJob,
  type BulkCancelNotificationStatus,
} from "./appointment";

const REASONS = ["Doctor unavailable", "Clinic closed", "Technical issue", "Clinical issue", "Other"] as const;
type Reason = (typeof REASONS)[number];

const PREVIEW_LANGUAGES: { key: string; label: string }[] = [
  { key: "hi", label: "Hinglish" },
  { key: "en", label: "English" },
];

const STATUS_LABELS: Record<BulkCancelNotificationStatus, string> = {
  sent: "Sent",
  pending: "Sending",
  failed: "Failed",
  opted_out: "Opted out (STOP)",
  blocked: "Blocked number",
  template_not_approved: "Not sent — template not approved",
};

function newIdempotencyKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface BulkCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Explicit rows, or the list filter for "Select all N matching". */
  selection: { appointmentIds: string[] } | { filter: BulkCancelFilter };
  /** How many appointments the selection covers (for the copy only). */
  count: number;
  /** Called once the cancellations are saved — the board refetches and leaves selection mode. */
  onCancelled: () => void;
}

/** Reason -> preview of the exact WhatsApp template -> confirm -> live summary.
 * Mount with a fresh `key` per open so the idempotency key and form reset. */
export function BulkCancelDialog({ open, onOpenChange, selection, count, onCancelled }: BulkCancelDialogProps) {
  const [step, setStep] = useState<"reason" | "preview">("reason");
  const [reason, setReason] = useState<Reason | "">("");
  const [otherText, setOtherText] = useState("");
  const [idempotencyKey] = useState(newIdempotencyKey);
  const [submitting, setSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  const finalReason = reason === "Other" ? otherText.trim() : reason;

  const previewQuery = useQuery({
    queryKey: ["appointments", "bulk-cancel-preview"],
    queryFn: async () => (await appointmentService.bulkCancelPreview()).data,
    enabled: open && step === "preview",
  });

  const jobQuery = useQuery({
    queryKey: ["appointments", "bulk-cancel-job", jobId],
    queryFn: async () => (await appointmentService.bulkCancelJob(jobId as string)).data.job,
    enabled: Boolean(jobId),
    refetchInterval: (query) => (query.state.data?.status === "completed" ? false : 2000),
  });

  const submit = async () => {
    if (submitting || !finalReason) return;
    setSubmitting(true);
    try {
      const res = await appointmentService.bulkCancel({
        reason: finalReason,
        idempotency_key: idempotencyKey,
        ...("filter" in selection
          ? { select_all_matching: selection.filter }
          : { appointment_ids: selection.appointmentIds }),
      });
      setJobId(res.data.job._id);
      toast.success(res.msg);
      onCancelled();
    } catch (err) {
      const e = err as NormalizedApiError;
      toast.error(e.error ?? "Something went wrong", e.msg);
    } finally {
      setSubmitting(false);
    }
  };

  const preview = previewQuery.data;
  const job: BulkCancelJob | undefined = jobQuery.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{jobId ? "Bulk cancel summary" : `Cancel ${count} appointment${count === 1 ? "" : "s"}`}</DialogTitle>
          <DialogDescription>
            {jobId
              ? "Appointments are cancelled. WhatsApp messages go out one by one."
              : "Slots are freed up and each patient gets one WhatsApp message."}
          </DialogDescription>
        </DialogHeader>

        {jobId ? (
          <JobSummary job={job} />
        ) : step === "reason" ? (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (finalReason) setStep("preview");
            }}
          >
            <div>
              <label htmlFor="bulk-cancel-reason" className="mb-1.5 block text-sm font-medium">
                Reason (saved on each appointment)
              </label>
              <select
                id="bulk-cancel-reason"
                required
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={reason}
                onChange={(e) => setReason(e.target.value as Reason | "")}
              >
                <option value="" disabled>
                  Select a reason
                </option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            {reason === "Other" && (
              <div>
                <label htmlFor="bulk-cancel-other" className="mb-1.5 block text-sm font-medium">
                  Details
                </label>
                <Textarea
                  id="bulk-cancel-other"
                  autoFocus
                  rows={3}
                  maxLength={300}
                  placeholder="Tell the team why"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                />
              </div>
            )}
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Keep appointments
              </Button>
              <Button type="submit" disabled={!finalReason}>
                Preview message
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-3">
            {previewQuery.isLoading || !preview ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                {!preview.send_enabled && (
                  <div className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                      WhatsApp sending is off until Meta approves the <code>{preview.template_name}</code> template.
                      The appointments will still be cancelled — inform these patients another way for now.
                    </p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {`Each patient ${preview.send_enabled ? "will get" : "would get"} this message in their language `}
                  (shown with the sample name &ldquo;{preview.sample_name}&rdquo;):
                </p>
                {PREVIEW_LANGUAGES.map(({ key, label }) =>
                  preview.previews[key] ? (
                    <div key={key}>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
                      <p className="whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-3 text-sm">
                        {preview.previews[key]}
                      </p>
                    </div>
                  ) : null
                )}
              </>
            )}
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setStep("reason")} disabled={submitting}>
                Back
              </Button>
              <Button type="button" variant="destructive" disabled={!preview || submitting} onClick={submit}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Cancel {count} appointment{count === 1 ? "" : "s"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function JobSummary({ job }: { job: BulkCancelJob | undefined }) {
  if (!job) return <Skeleton className="h-32 w-full" />;
  const done = job.status === "completed";
  const statusRows = (Object.keys(STATUS_LABELS) as BulkCancelNotificationStatus[]).filter((s) => job.counts[s] > 0);
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-2">
        {done ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        ) : (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        <span>
          {job.cancelled_count} cancelled
          {job.skipped.length > 0 && ` · ${job.skipped.length} skipped (already cancelled or completed)`}
        </span>
      </div>
      {job.patients.length > 0 && (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {statusRows.map((s) => (
            <li key={s} className="flex justify-between px-3 py-2">
              <span>{STATUS_LABELS[s]}</span>
              <span className="font-medium tabular-nums">{job.counts[s]}</span>
            </li>
          ))}
        </ul>
      )}
      {done && job.patients.some((p) => p.notification_status !== "sent") && (
        <details>
          <summary className="cursor-pointer text-muted-foreground">Patients not messaged</summary>
          <ul className="mt-2 space-y-1">
            {job.patients
              .filter((p) => p.notification_status !== "sent")
              .map((p) => (
                <li key={p.patient_id} className="flex justify-between gap-3">
                  <span className="truncate">
                    {p.patient_name ?? "Unknown"} {p.phone && <span className="text-muted-foreground">· {p.phone}</span>}
                  </span>
                  <span className="shrink-0 text-muted-foreground">{STATUS_LABELS[p.notification_status]}</span>
                </li>
              ))}
          </ul>
        </details>
      )}
    </div>
  );
}
