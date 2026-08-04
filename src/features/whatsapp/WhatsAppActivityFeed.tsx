"use client";

import { useQuery } from "@tanstack/react-query";
import { History, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { whatsappService, type ApiAuditLog } from "./whatsapp";

const POLL_MS = 15000;

function describeActivity(log: ApiAuditLog): string {
  const d = log.details;
  const name = typeof d.name === "string" ? d.name : "";
  const templateName = typeof d.template_name === "string" ? d.template_name : "";

  switch (log.action) {
    case "template_sync":
      return `Synced ${Number(d.synced) || 0} template(s) from Meta`;
    case "template_request_created":
      return `Requested template "${name}" (${String(d.category ?? "")})`;
    case "template_status_update":
      return `Template "${name}" ${String(d.status ?? "").toLowerCase()}`;
    case "template_request_retried":
      return `Retried template "${name}"`;
    case "broadcast_created":
      return d.scheduled_at
        ? `Scheduled a broadcast using "${templateName}" to ${Number(d.total) || 0} recipient(s)`
        : `Sent a broadcast using "${templateName}" to ${Number(d.total) || 0} recipient(s)`;
    default:
      return log.action;
  }
}

/** Module-level activity trail — template syncs/requests/approvals,
 * broadcasts sent — kept short and scrollable, not a full audit log page,
 * so it reads as an intentional enterprise touch rather than clutter. */
export function WhatsAppActivityFeed() {
  const { data, isLoading } = useQuery({
    queryKey: ["whatsapp", "activity-feed"],
    queryFn: () => whatsappService.getGlobalAuditLog(),
    refetchInterval: POLL_MS,
  });

  const logs = data?.data.logs ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" /> Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading && logs.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">No activity yet.</p>
        )}
        <ul className="max-h-64 divide-y divide-border overflow-y-auto text-sm">
          {logs.map((log) => (
            <li key={log.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 py-2">
              <span>{describeActivity(log)}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {log.actor_name} · {log.created_at}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
