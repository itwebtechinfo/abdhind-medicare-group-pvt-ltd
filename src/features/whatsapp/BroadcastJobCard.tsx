"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { whatsappService } from "./whatsapp";
import { POLL_INTERVALS } from "@/src/lib/polling";

/** Renders at most this many recipients — the full list can be thousands. */
const RECIPIENT_PREVIEW_LIMIT = 200;

const STATUS_VARIANT = {
  scheduled: "secondary",
  pending: "secondary",
  running: "warning",
  completed: "success",
} as const;

interface BroadcastJobCardProps {
  jobId: string;
}

export function BroadcastJobCard({ jobId }: BroadcastJobCardProps) {
  const { data } = useQuery({
    queryKey: ["whatsapp", "broadcast", jobId],
    queryFn: () => whatsappService.getBroadcastJob(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.data.job.status;
      if (status === "completed") return false;
      // A "scheduled" job can be due days out — nothing changes until then,
      // so polling like an in-flight send would just be noise.
      return status === "scheduled" ? POLL_INTERVALS.broadcastScheduled : POLL_INTERVALS.broadcastSending;
    },
  });

  const job = data?.data.job;

  // Fetched once, on demand — kept out of the status poll above (heavy + PII).
  const [showRecipients, setShowRecipients] = useState(false);
  const { data: recipients, isLoading: recipientsLoading, isError: recipientsError } = useQuery({
    queryKey: ["whatsapp", "broadcast", jobId, "recipients"],
    queryFn: async () =>
      (await whatsappService.getBroadcastJob(jobId, { includeRecipients: true })).data.job.resolved_recipients ?? [],
    enabled: showRecipients,
    staleTime: Infinity,
  });

  if (!job) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading job status…
        </CardContent>
      </Card>
    );
  }

  const done = job.sent_count + job.failed_count;
  const pct = job.total > 0 ? Math.round((done / job.total) * 100) : 0;

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{job.template_name}</p>
            <p className="text-xs text-muted-foreground">
              by {job.created_by.name} · {job.created_at}
            </p>
          </div>
          <Badge variant={STATUS_VARIANT[job.status]}>{job.status}</Badge>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">
          {done} / {job.total} processed · {job.sent_count} sent · {job.failed_count} failed
        </p>
        {job.status === "scheduled" && job.scheduled_at && (
          <p className="text-[11px] text-muted-foreground">
            Scheduled for {new Date(job.scheduled_at).toLocaleString()}
          </p>
        )}
        {(job.started_at || job.completed_at) && (
          <p className="text-[11px] text-muted-foreground">
            {job.started_at && <>Started {new Date(job.started_at).toLocaleTimeString()}</>}
            {job.started_at && job.completed_at && " · "}
            {job.completed_at && <>Completed {new Date(job.completed_at).toLocaleTimeString()}</>}
          </p>
        )}

        {(job.variables.length > 0 || job.header_variables.length > 0 || job.button_variables.length > 0) && (
          <p className="text-[11px] text-muted-foreground">
            {job.variables.length > 0 && <>Body: {job.variables.join(", ")}</>}
            {job.header_variables.length > 0 && <> · Header: {job.header_variables.join(", ")}</>}
            {job.button_variables.length > 0 && <> · Button: {job.button_variables.join(", ")}</>}
          </p>
        )}

        <div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => setShowRecipients((v) => !v)}
          >
            {showRecipients ? "Hide recipients" : `Show recipients (${job.total})`}
          </Button>
          {showRecipients && (
            <div className="mt-1 max-h-32 overflow-y-auto rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
              {recipientsLoading && <p>Loading…</p>}
              {recipientsError && <p className="text-destructive">Couldn&apos;t load recipients.</p>}
              {recipients?.slice(0, RECIPIENT_PREVIEW_LIMIT).map((r, i) => (
                <p key={`${r.phone}-${i}`}>
                  {r.phone}
                  {r.variables.length > 0 && <> — {r.variables.join(", ")}</>}
                </p>
              ))}
              {recipients && recipients.length > RECIPIENT_PREVIEW_LIMIT && (
                <p className="mt-1 italic">…and {recipients.length - RECIPIENT_PREVIEW_LIMIT} more</p>
              )}
              {recipients && recipients.length === 0 && <p>No recipient list stored for this job.</p>}
            </div>
          )}
        </div>

        {job.failures.length > 0 && (
          <div className="max-h-24 overflow-y-auto rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
            {job.failures.map((f, i) => (
              <p key={i}>
                {f.phone} — {f.reason}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
