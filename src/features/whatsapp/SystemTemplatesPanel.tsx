"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Loader2, Send } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";
import { TEMPLATE_REQUESTS_QUERY_KEY } from "./TemplateRequestsPanel";
import { TEMPLATES_QUERY_KEY } from "./TemplatesPanel";
import { whatsappService, type SystemTemplate } from "./whatsapp";

export const SYSTEM_TEMPLATES_QUERY_KEY = ["whatsapp", "systemTemplates"] as const;

/** Still waiting on Meta (or on our own submit call) — keep polling. */
const IN_FLIGHT = new Set(["SUBMITTING", "PENDING", "IN_APPEAL"]);
/** Nothing live on Meta yet — "Submit missing" will (re)send these. */
const SUBMITTABLE = new Set(["NOT_SUBMITTED", "SUBMIT_FAILED"]);

function statusVariant(status: string): "success" | "warning" | "destructive" | "secondary" {
  if (status === "APPROVED") return "success";
  if (IN_FLIGHT.has(status)) return "warning";
  if (status === "REJECTED" || status === "SUBMIT_FAILED" || status === "DISABLED") return "destructive";
  return "secondary";
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ").toLowerCase();
}

/** Built-in templates the system itself sends (reminders, approvals, OTP…),
 * one row per template with a badge per language. Adding an entry to
 * SYSTEM_TEMPLATES in routes/whatsapp.py makes it show up here automatically. */
export function SystemTemplatesPanel() {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: SYSTEM_TEMPLATES_QUERY_KEY,
    queryFn: async () => (await whatsappService.listSystemTemplates()).data.templates,
    refetchInterval: (query) =>
      (query.state.data ?? []).some((t) => IN_FLIGHT.has(t.status)) ? 30000 : false,
  });

  const grouped = useMemo(() => {
    const byName = new Map<string, SystemTemplate[]>();
    for (const t of data ?? []) byName.set(t.name, [...(byName.get(t.name) ?? []), t]);
    return [...byName.entries()];
  }, [data]);

  const rows = data ?? [];
  const approved = rows.filter((t) => t.status === "APPROVED" && t.variables_match).length;
  const submittable = rows.filter((t) => SUBMITTABLE.has(t.status)).length;

  const seedMutation = useMutation({
    mutationFn: () => whatsappService.seedSystemTemplates(),
    onSuccess: (res) => {
      const results = res.data.results;
      const failed = results.filter((r) => r.status === "SUBMIT_FAILED").length;
      const submitted = results.filter((r) => r.status !== "SKIPPED" && r.status !== "SUBMIT_FAILED").length;
      if (failed > 0) {
        toast.error("Some templates failed to submit", `${submitted} submitted, ${failed} failed — see the reasons below.`);
      } else {
        toast.success(res.msg, `${submitted} submitted to Meta for review`);
      }
      setConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: SYSTEM_TEMPLATES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TEMPLATE_REQUESTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY });
    },
    onError: (err: NormalizedApiError) => {
      setConfirmOpen(false);
      toast.error(err.error, err.msg);
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">System Templates</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Messages the clinic sends automatically. Outside WhatsApp&apos;s 24-hour window only an approved
            template reaches the patient.
            {data && ` ${approved}/${rows.length} ready.`}
          </p>
        </div>
        <Button
          size="sm"
          className="shrink-0 gap-1.5"
          disabled={submittable === 0 || seedMutation.isPending}
          onClick={() => setConfirmOpen(true)}
        >
          {seedMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Submit missing ({submittable})
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {isError && <p className="py-4 text-center text-sm text-destructive">Couldn&apos;t load system templates.</p>}

        <div className="space-y-2">
          {grouped.map(([name, variants]) => {
            const isOpen = expanded === name;
            const first = variants[0];
            return (
              <div key={name} className="rounded-lg border border-border px-3 py-2 text-sm">
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-2 text-left"
                  onClick={() => setExpanded(isOpen ? null : name)}
                  aria-expanded={isOpen}
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 font-medium">
                      {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      <span className="font-mono text-xs">{name}</span>
                      <span className="text-xs text-muted-foreground">({first.category.toLowerCase()})</span>
                    </p>
                    {first.purpose && <p className="mt-0.5 pl-4 text-xs text-muted-foreground">{first.purpose}</p>}
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-1">
                    {variants.map((v) => (
                      <Badge key={v.language} variant={statusVariant(v.status)} className="text-[10px]">
                        {v.language}: {statusLabel(v.status)}
                      </Badge>
                    ))}
                  </div>
                </button>

                {variants.map((v) =>
                  v.reason || !v.variables_match ? (
                    <p key={`${v.language}-issue`} className="mt-1 pl-4 text-xs text-destructive">
                      {v.language}:{" "}
                      {!v.variables_match
                        ? "the approved copy on Meta takes a different number of variables, so it won't be used"
                        : v.reason}
                    </p>
                  ) : null
                )}

                {isOpen && (
                  <div className="mt-2 space-y-2 pl-4">
                    {first.variables.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Variables:{" "}
                        {first.variables.map((label, i) => `{{${i + 1}}} ${label}`).join(" · ")}
                      </p>
                    )}
                    {first.buttons.length > 0 && (
                      <p className="text-xs text-muted-foreground">Buttons: {first.buttons.join(" · ")}</p>
                    )}
                    {variants.map((v) => (
                      <div key={`${v.language}-body`}>
                        <p className="text-[11px] font-medium">{v.language}</p>
                        <p className="whitespace-pre-wrap rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                          {v.body ?? "Body is generated by Meta for authentication templates."}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(next) => !seedMutation.isPending && setConfirmOpen(next)}
        title="Submit system templates to Meta"
        description={`${submittable} template version(s) that Meta doesn't have yet will be submitted for review. Templates already on Meta are skipped. Approval usually takes a few minutes to a day.`}
        confirmLabel="Submit"
        isLoading={seedMutation.isPending}
        onConfirm={() => seedMutation.mutate()}
      />
    </Card>
  );
}
