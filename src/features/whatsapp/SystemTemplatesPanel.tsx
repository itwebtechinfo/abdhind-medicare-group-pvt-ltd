"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRightLeft, ChevronDown, ChevronRight, Loader2, Send } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { usePermission } from "@/src/hooks/usePermission";
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";
import { TEMPLATE_REQUESTS_QUERY_KEY } from "./TemplateRequestsPanel";
import { TEMPLATES_QUERY_KEY } from "./TemplatesPanel";
import { whatsappService, type SystemTemplate } from "./whatsapp";
import { POLL_INTERVALS } from "@/src/lib/polling";

export const SYSTEM_TEMPLATES_QUERY_KEY = ["whatsapp", "systemTemplates"] as const;
const TEMPLATE_NAME_MAP_QUERY_KEY = ["whatsapp", "templateNameMap"] as const;

/** "appointment_approved" -> "Appointment approved". */
function messageTypeLabel(type: string) {
  const words = type.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

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
  const [switchTo, setSwitchTo] = useState<SystemTemplate | null>(null);
  const { role } = usePermission();
  const canSwitch = role === "admin" || role === "system_admin";

  const { data: nameMap } = useQuery({
    queryKey: TEMPLATE_NAME_MAP_QUERY_KEY,
    queryFn: async () => (await whatsappService.getTemplateNameMap()).data,
    enabled: canSwitch,
  });

  const switchMutation = useMutation({
    mutationFn: (t: SystemTemplate) => whatsappService.updateTemplateNameMap({ [t.message_type as string]: t.name }),
    onSuccess: (_res, t) => {
      toast.success("Template switched", `${messageTypeLabel(t.message_type as string)} messages now use ${t.name}.`);
      setSwitchTo(null);
      queryClient.invalidateQueries({ queryKey: SYSTEM_TEMPLATES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TEMPLATE_NAME_MAP_QUERY_KEY });
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: SYSTEM_TEMPLATES_QUERY_KEY,
    queryFn: async () => (await whatsappService.listSystemTemplates()).data.templates,
    refetchInterval: (query) =>
      (query.state.data ?? []).some((t) => IN_FLIGHT.has(t.status)) ? POLL_INTERVALS.templateReview : false,
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
      const isFailure = (status: string) => status === "SUBMIT_FAILED" || status === "INVALID";
      const failed = results.filter((r) => isFailure(r.status)).length;
      const submitted = results.filter((r) => r.status !== "SKIPPED" && !isFailure(r.status)).length;
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
            // Approved (in a usable shape) but not what its message type sends yet.
            const switchable =
              canSwitch &&
              !first.active &&
              Boolean(first.message_type) &&
              variants.some((v) => v.status === "APPROVED" && v.variables_match);
            return (
              <div key={name} className="rounded-lg border border-border px-3 py-2 text-sm">
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-2 text-left"
                  onClick={() => setExpanded(isOpen ? null : name)}
                  aria-expanded={isOpen}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 font-medium">
                      {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      <span className="font-mono text-xs">{name}</span>
                      <span className="text-xs text-muted-foreground">({first.category.toLowerCase()})</span>
                      {first.active ? (
                        <Badge variant="secondary" className="text-[10px]">In use</Badge>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">not in use yet</span>
                      )}
                    </div>
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

                {switchable && (
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 pl-4 text-xs">
                    <span className="text-muted-foreground">
                      Approved, not in use. {messageTypeLabel(first.message_type as string)} now sends{" "}
                      <span className="font-mono">{nameMap?.effective[first.message_type as string] ?? "…"}</span>.
                    </span>
                    <Button size="sm" variant="outline" className="h-7 gap-1.5" onClick={() => setSwitchTo(first)}>
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      Use this version
                    </Button>
                  </div>
                )}

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
        open={Boolean(switchTo)}
        onOpenChange={(next) => !switchMutation.isPending && !next && setSwitchTo(null)}
        title="Use this template version?"
        description={
          switchTo
            ? `${messageTypeLabel(switchTo.message_type as string)} messages currently use "${
                nameMap?.effective[switchTo.message_type as string] ?? "?"
              }". From now on they will use "${switchTo.name}". You can switch back the same way.`
            : undefined
        }
        confirmLabel="Use this version"
        isLoading={switchMutation.isPending}
        onConfirm={() => switchTo && switchMutation.mutate(switchTo)}
      />

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
