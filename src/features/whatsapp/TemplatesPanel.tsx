"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { toast } from "@/src/lib/toast";
import { formatEpochMs } from "@/src/lib/format";
import type { NormalizedApiError } from "@/src/types/api";
import { whatsappService } from "./whatsapp";

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "destructive",
};

export const TEMPLATES_QUERY_KEY = ["whatsapp", "templates"] as const;

export function TemplatesPanel() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: TEMPLATES_QUERY_KEY,
    queryFn: () => whatsappService.listTemplates(),
  });

  const syncMutation = useMutation({
    mutationFn: () => whatsappService.syncTemplates(),
    onSuccess: (res) => {
      toast.success(res.msg);
      queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY });
    },
    onError: (err: NormalizedApiError) => {
      if (err.error === "Configuration Error") {
        toast.error("WhatsApp Business Account not configured", err.msg);
      } else {
        toast.error(err.error, err.msg);
      }
    },
  });

  const templates = data?.data.templates ?? [];
  // Every sync rewrites every template, so the newest stamp is "last synced".
  const lastSyncedAt = templates.reduce<number | null>(
    (latest, t) => (t.synced_at && (!latest || t.synced_at > latest) ? t.synced_at : latest),
    null
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Approved Templates</CardTitle>
          {lastSyncedAt && (
            <p className="mt-0.5 text-xs text-muted-foreground">Last synced {formatEpochMs(lastSyncedAt)}</p>
          )}
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" disabled={syncMutation.isPending} onClick={() => syncMutation.mutate()}>
          {syncMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Sync from Meta
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading && templates.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No templates cached yet — sync from Meta to populate this list.
          </p>
        )}
        <div className="space-y-2">
          {templates.map((template) => {
            const body = template.components.find((c) => c.type === "BODY");
            return (
              <div key={template.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{template.name}</span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {template.category && (
                      <Badge variant="outline" className="text-[10px]">
                        {template.category.toLowerCase()}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {template.language}
                    </Badge>
                    <Badge variant={STATUS_VARIANT[template.status] ?? "secondary"} className="text-[10px]">
                      {template.status}
                    </Badge>
                  </div>
                </div>
                {body?.text && <p className="mt-1 text-xs text-muted-foreground">{body.text}</p>}
                {template.meta_template_id && (
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">Meta ID: {template.meta_template_id}</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
