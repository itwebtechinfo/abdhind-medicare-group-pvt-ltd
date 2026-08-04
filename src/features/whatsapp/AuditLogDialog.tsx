"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { whatsappService } from "./whatsapp";

const ACTION_LABELS: Record<string, string> = {
  takeover: "Took over",
  release: "Released to bot",
  note_added: "Added note",
  message_sent: "Sent message",
  tags_updated: "Updated tags",
  export: "Exported transcript",
  message_retry: "Retried message",
  template_sync: "Synced templates",
  broadcast_created: "Created broadcast",
};

interface AuditLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phone: string;
}

export function AuditLogDialog({ open, onOpenChange, phone }: AuditLogDialogProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["whatsapp", "audit-log", phone],
    queryFn: () => whatsappService.getAuditLog(phone),
    enabled: open && Boolean(phone),
  });

  const logs = data?.data.logs ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Audit Log</DialogTitle>
          <DialogDescription>Staff action trail for this conversation.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-2 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && logs.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No actions recorded yet.</p>
          )}
          {logs.map((log) => (
            <div key={log.id} className="rounded-lg border border-border px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary">{ACTION_LABELS[log.action] ?? log.action}</Badge>
                <span className="text-xs text-muted-foreground">{log.created_at}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">by {log.actor_name}</p>
              {Object.keys(log.details).length > 0 && (
                <p className="mt-1 break-words text-xs text-muted-foreground">
                  {Object.entries(log.details)
                    .map(([key, value]) => `${key}: ${String(value)}`)
                    .join(" · ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
