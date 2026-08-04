"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { toast } from "@/src/lib/toast";
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Approved Templates</CardTitle>
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
                    <Badge variant="outline" className="text-[10px]">
                      {template.language}
                    </Badge>
                    <Badge variant={STATUS_VARIANT[template.status] ?? "secondary"} className="text-[10px]">
                      {template.status}
                    </Badge>
                  </div>
                </div>
                {body?.text && <p className="mt-1 text-xs text-muted-foreground">{body.text}</p>}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
