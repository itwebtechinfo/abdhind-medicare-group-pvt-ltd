"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import { whatsappService } from "./whatsapp";

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
      // so polling every 2.5s like an in-flight send would just be noise.
      return status === "scheduled" ? 30000 : 2500;
    },
  });

  const job = data?.data.job;

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
