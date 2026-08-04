"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, RotateCcw } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";
import { whatsappService, type ApiTemplateRequest, type TemplateRequestStatus } from "./whatsapp";

export const TEMPLATE_REQUESTS_QUERY_KEY = ["whatsapp", "templateRequests"] as const;

const STATUS_VARIANT: Record<TemplateRequestStatus, "success" | "warning" | "destructive" | "secondary"> = {
  SUBMITTING: "secondary",
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  SUBMIT_FAILED: "destructive",
};

const TERMINAL_STATUSES: TemplateRequestStatus[] = ["APPROVED", "REJECTED", "SUBMIT_FAILED"];

export function TemplateRequestsPanel() {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: TEMPLATE_REQUESTS_QUERY_KEY,
    queryFn: () => whatsappService.listTemplateRequests(),
    // Keeps polling the whole list while anything is still awaiting Meta —
    // mirrors BroadcastJobCard's 2.5s-until-terminal pattern, applied at
    // list level since several requests can be in flight at once.
    refetchInterval: (query) => {
      const requests = query.state.data?.data.requests ?? [];
      const stillPending = requests.some((r) => !TERMINAL_STATUSES.includes(r.status));
      return stillPending ? 2500 : false;
    },
  });

  const requests = data?.data.requests ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Template Requests</CardTitle>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          disabled={isFetching}
          onClick={() => queryClient.invalidateQueries({ queryKey: TEMPLATE_REQUESTS_QUERY_KEY })}
        >
          {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading && requests.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No template requests yet — submit one above.
          </p>
        )}
        <div className="space-y-2">
          {requests.map((request) => (
            <TemplateRequestRow key={request.id} request={request} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateRequestRow({ request }: { request: ApiTemplateRequest }) {
  const queryClient = useQueryClient();
  const reason =
    request.status === "REJECTED"
      ? request.rejected_reason
      : request.status === "SUBMIT_FAILED"
        ? request.submit_error
        : null;

  const retryMutation = useMutation({
    mutationFn: () => whatsappService.retryTemplateRequest(request.id),
    onSuccess: (res) => {
      toast.success(res.msg);
      queryClient.invalidateQueries({ queryKey: TEMPLATE_REQUESTS_QUERY_KEY });
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  return (
    <div className="rounded-lg border border-border px-3 py-2 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="font-medium">{request.name}</span>
          <span className="ml-1.5 text-xs text-muted-foreground">({request.category.toLowerCase()})</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge variant="outline" className="text-[10px]">
            {request.language}
          </Badge>
          <Badge variant={STATUS_VARIANT[request.status]} className="text-[10px]">
            {request.status.replace("_", " ")}
          </Badge>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {request.created_by.name} · {request.created_at}
      </p>
      {reason && <p className="mt-1 text-xs text-destructive">{reason}</p>}
      {request.status === "SUBMIT_FAILED" && (
        <Button
          size="sm"
          variant="outline"
          className="mt-2 gap-1.5"
          disabled={retryMutation.isPending}
          onClick={() => retryMutation.mutate()}
        >
          {retryMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
          Retry
        </Button>
      )}
    </div>
  );
}
