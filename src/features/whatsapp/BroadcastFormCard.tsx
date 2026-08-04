"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FileUp, Loader2, Megaphone, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Switch } from "@/src/components/ui/switch";
import { InfoTooltip } from "@/src/components/ui/info-tooltip";
import { cn } from "@/src/lib/utils";
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";
import {
  broadcastSchema,
  templateVariableCount,
  templateHasHeaderVariable,
  templateHasButtonVariable,
  whatsappService,
  EMPTY_BROADCAST_VALUES,
  type BroadcastFormValues,
  type CreateBroadcastPayload,
} from "./whatsapp";

const SELECT_CLASS =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const TARGET_MODES: { value: BroadcastFormValues["target_mode"]; label: string }[] = [
  { value: "phones", label: "Phone list" },
  { value: "all_patients", label: "All patients" },
  { value: "inactive_days", label: "Inactive since…" },
  { value: "csv", label: "Upload CSV" },
];

const RECIPIENT_MODE_HELP: Record<BroadcastFormValues["target_mode"], string> = {
  phones: "Enter the numbers to send to — one per line, or comma-separated.",
  all_patients: "Sends to every registered patient at the hospital — a large audience, use carefully.",
  inactive_days: "Only patients who haven't visited in this many days — e.g. 180 targets anyone gone quiet for 6+ months.",
  csv: "Upload a CSV to send a different name/date/value to each person, instead of the same text to everyone.",
};

const BROADCAST_STEPS = [
  "Choose a template",
  "Fill in variables",
  "Select recipients",
  "Send",
];

/** Waits for `value` to stop changing for `delayMs` before updating — used
 * to avoid firing the audience-preview call on every keystroke. */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

interface BroadcastFormCardProps {
  onCreated: (jobId: string) => void;
}

export function BroadcastFormCard({ onCreated }: BroadcastFormCardProps) {
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);

  const { data: templatesData } = useQuery({
    queryKey: ["whatsapp", "templates"],
    queryFn: () => whatsappService.listTemplates("approved"),
  });
  const templates = templatesData?.data.templates ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastSchema) as unknown as Resolver<BroadcastFormValues>,
    defaultValues: EMPTY_BROADCAST_VALUES,
  });

  const templateName = watch("template_name");
  const targetMode = watch("target_mode");
  const variables = watch("variables");
  const phonesRaw = watch("phones_raw");
  const inactiveSinceDays = watch("inactive_since_days");
  const csvRecipients = watch("csv_recipients");
  const sendLater = watch("send_later");

  const selectedTemplate = templates.find((t) => t.name === templateName);
  const variableCount = selectedTemplate ? templateVariableCount(selectedTemplate) : 0;
  const hasHeaderVariable = selectedTemplate ? templateHasHeaderVariable(selectedTemplate) : false;
  const hasButtonVariable = selectedTemplate ? templateHasButtonVariable(selectedTemplate) : false;

  useEffect(() => {
    if (!selectedTemplate) return;
    setValue("language", selectedTemplate.language);
    setValue(
      "variables",
      Array.from({ length: variableCount }, (_, i) => variables[i] ?? "")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the selected template itself changes
  }, [selectedTemplate, variableCount]);

  // ---------- Audience preview (dry run, no job created) ----------
  const targetingPayload: Pick<CreateBroadcastPayload, "phones" | "filter" | "recipients"> | null = (() => {
    if (targetMode === "csv") {
      return csvRecipients.length > 0 ? { recipients: csvRecipients, phones: null, filter: null } : null;
    }
    if (targetMode === "phones") {
      const phones = (phonesRaw ?? "").split(/[\n,]/).map((p) => p.trim()).filter(Boolean);
      return phones.length > 0 ? { phones, filter: null, recipients: null } : null;
    }
    if (targetMode === "all_patients") {
      return { filter: { all_patients: true }, phones: null, recipients: null };
    }
    return inactiveSinceDays !== undefined
      ? { filter: { inactive_since_days: inactiveSinceDays }, phones: null, recipients: null }
      : null;
  })();
  const debouncedTargetingPayload = useDebouncedValue(targetingPayload, 500);

  const { data: previewData, isFetching: previewFetching } = useQuery({
    queryKey: ["whatsapp", "broadcast", "preview", debouncedTargetingPayload],
    queryFn: () => whatsappService.previewBroadcastRecipients(debouncedTargetingPayload!),
    enabled: debouncedTargetingPayload !== null,
  });
  const previewCount = previewData?.data.count ?? null;

  // ---------- CSV upload ----------
  function handleCsvFile(file: File) {
    setCsvFileName(file.name);
    setCsvError(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        if (rows.length === 0) {
          setCsvError("CSV has no data rows.");
          setValue("csv_recipients", []);
          return;
        }
        const headerKeys = Object.keys(rows[0]);
        const phoneKey = headerKeys.find((k) => k.trim().toLowerCase() === "phone");
        if (!phoneKey) {
          setCsvError("CSV must have a 'phone' column.");
          setValue("csv_recipients", []);
          return;
        }
        const varColumns = headerKeys.filter((k) => k !== phoneKey);
        const parsed: { phone: string; variables: string[] }[] = [];
        let skipped = 0;
        for (const row of rows) {
          const phone = (row[phoneKey] ?? "").trim();
          if (!phone) {
            skipped += 1;
            continue;
          }
          parsed.push({ phone, variables: varColumns.map((c) => (row[c] ?? "").trim()) });
        }
        if (skipped > 0) {
          setCsvError(`${skipped} row(s) skipped — missing a phone number.`);
        }
        setValue("csv_recipients", parsed, { shouldValidate: true });
      },
      error: (err) => setCsvError(err.message),
    });
  }

  function clearCsv() {
    setCsvFileName(null);
    setCsvError(null);
    setValue("csv_recipients", []);
    if (csvInputRef.current) csvInputRef.current.value = "";
  }

  const broadcastMutation = useMutation({
    mutationFn: (payload: CreateBroadcastPayload) => whatsappService.createBroadcast(payload),
    onSuccess: (res) => {
      toast.success(res.msg, `${res.data.total} recipient(s) queued.`);
      onCreated(res.data.job_id);
      reset(EMPTY_BROADCAST_VALUES);
      clearCsv();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const onSubmit = handleSubmit((values) => {
    const payload: CreateBroadcastPayload = {
      template_name: values.template_name,
      language: values.language,
      variables: values.variables,
      header_variables: values.header_variable?.trim() ? [values.header_variable.trim()] : [],
      button_variables: values.button_variable?.trim() ? [values.button_variable.trim()] : [],
      phones: null,
      filter: null,
      recipients: null,
      scheduled_at: null,
    };
    if (values.target_mode === "csv") {
      payload.recipients = values.csv_recipients;
    } else if (values.target_mode === "phones") {
      payload.phones = (values.phones_raw ?? "")
        .split(/[\n,]/)
        .map((p) => p.trim())
        .filter(Boolean);
    } else if (values.target_mode === "all_patients") {
      payload.filter = { all_patients: true };
    } else {
      payload.filter = { inactive_since_days: values.inactive_since_days };
    }
    if (values.send_later && values.scheduled_at_local) {
      payload.scheduled_at = new Date(values.scheduled_at_local).getTime();
    }
    broadcastMutation.mutate(payload);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="h-4 w-4" /> New Broadcast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="mb-4 flex flex-wrap items-center gap-x-1.5 gap-y-1.5 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          {BROADCAST_STEPS.map((step, i) => (
            <li key={step} className="flex items-center gap-1.5">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                {i + 1}
              </span>
              <span>{step}</span>
              {i < BROADCAST_STEPS.length - 1 && <span className="ml-1 text-border">→</span>}
            </li>
          ))}
        </ol>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <label className="text-sm font-medium">Template</label>
              <InfoTooltip text="This is a message already approved by Meta (WhatsApp). To add a new one, submit it via 'Templates' in the sidebar — no need to go to WhatsApp Manager." />
            </div>
            <select className={SELECT_CLASS} {...register("template_name")}>
              <option value="">Select an approved template…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.language})
                </option>
              ))}
            </select>
            {errors.template_name && <p className="mt-1 text-xs text-destructive">{errors.template_name.message}</p>}
            {templates.length === 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                No approved templates cached —{" "}
                <Link href="/whatsapp/templates" className="font-medium text-primary hover:underline">
                  sync from Meta or request a new one
                </Link>
                .
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <label className="text-sm font-medium">Language</label>
              <InfoTooltip text="This fills in automatically with the language the template was approved in — don't change it." />
            </div>
            <Input {...register("language")} placeholder="en_US" />
            {errors.language && <p className="mt-1 text-xs text-destructive">{errors.language.message}</p>}
          </div>

          {variableCount > 0 && targetMode !== "csv" && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <label className="block text-sm font-medium">
                  Template variables ({variableCount}) — same values sent to every recipient
                </label>
                <InfoTooltip text="These fill in the message's {{1}}, {{2}} placeholders — the same values go to every recipient. Switch to 'Upload CSV' below to send a different value per person." />
              </div>
              {Array.from({ length: variableCount }).map((_, i) => (
                <Input
                  key={i}
                  placeholder={`{{${i + 1}}}`}
                  value={variables[i] ?? ""}
                  onChange={(e) => {
                    const next = [...variables];
                    next[i] = e.target.value;
                    setValue("variables", next);
                  }}
                />
              ))}
            </div>
          )}

          {hasHeaderVariable && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5">
                <label className="text-sm font-medium">Header value</label>
                <InfoTooltip text="Fills the {{1}} in this template's header line — same value for every recipient in this broadcast." />
              </div>
              <Input placeholder="Header value" {...register("header_variable")} />
            </div>
          )}

          {hasButtonVariable && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5">
                <label className="text-sm font-medium">Link value</label>
                <InfoTooltip text="Fills the dynamic part of this template's button link — same value for every recipient in this broadcast." />
              </div>
              <Input placeholder="e.g. summer-offer" {...register("button_variable")} />
            </div>
          )}

          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <label className="text-sm font-medium">Recipients</label>
              <InfoTooltip text={RECIPIENT_MODE_HELP[targetMode]} />
            </div>
            <div className="flex flex-wrap gap-2">
              {TARGET_MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setValue("target_mode", mode.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    targetMode === mode.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background text-muted-foreground hover:bg-accent"
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {targetMode === "phones" && (
            <div>
              <Textarea
                rows={3}
                placeholder={"+919876543210\n9876543211"}
                {...register("phones_raw")}
              />
              <p className="mt-1 text-xs text-muted-foreground">One phone number per line or comma-separated.</p>
              {errors.phones_raw && <p className="mt-1 text-xs text-destructive">{errors.phones_raw.message}</p>}
            </div>
          )}

          {targetMode === "inactive_days" && (
            <div>
              <Input type="number" min={0} {...register("inactive_since_days")} placeholder="180" />
              <p className="mt-1 text-xs text-muted-foreground">
                Patients with no appointment (or none at all) in this many days.
              </p>
              {errors.inactive_since_days && (
                <p className="mt-1 text-xs text-destructive">{errors.inactive_since_days.message}</p>
              )}
            </div>
          )}

          {targetMode === "all_patients" && (
            <p className="text-xs text-muted-foreground">Sends to every patient on file.</p>
          )}

          {targetMode === "csv" && (
            <div>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCsvFile(file);
                }}
              />
              <Button type="button" size="sm" variant="outline" className="gap-2" onClick={() => csvInputRef.current?.click()}>
                <FileUp className="h-4 w-4" />
                {csvFileName ? "Change CSV" : "Choose CSV"}
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                Columns: <code>phone</code>
                {variableCount > 0 && <>, then {variableCount} more column{variableCount === 1 ? "" : "s"} for {"{{1}}"}{variableCount > 1 ? `..{{${variableCount}}}` : ""}</>}.
              </p>
              {csvFileName && (
                <div className="mt-1.5 flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1 text-xs">
                  <span className="truncate">{csvFileName}</span>
                  <span className="text-muted-foreground">({csvRecipients.length} recipient{csvRecipients.length === 1 ? "" : "s"})</span>
                  <button type="button" onClick={clearCsv} className="ml-auto shrink-0" aria-label="Remove CSV">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {csvError && <p className="mt-1 text-xs text-destructive">{csvError}</p>}
              {errors.csv_recipients && (
                <p className="mt-1 text-xs text-destructive">{errors.csv_recipients.message as string}</p>
              )}
              {csvRecipients.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-border text-xs">
                  <table className="w-full">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="px-2 py-1 font-medium">Phone</th>
                        <th className="px-2 py-1 font-medium">Variables</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvRecipients.slice(0, 5).map((r, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="px-2 py-1">{r.phone}</td>
                          <td className="px-2 py-1 text-muted-foreground">{r.variables.join(", ") || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvRecipients.length > 5 && (
                    <p className="border-t border-border px-2 py-1 text-muted-foreground">+{csvRecipients.length - 5} more</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-sm">
            {previewFetching ? (
              <span className="text-muted-foreground">Checking recipients…</span>
            ) : previewCount !== null ? (
              <span>
                This will reach <strong>{previewCount}</strong> {previewCount === 1 ? "person" : "people"}.
              </span>
            ) : (
              <span className="text-muted-foreground">Fill in recipients above to see how many people this will reach.</span>
            )}
          </div>

          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center gap-2.5">
              <Switch checked={sendLater} onCheckedChange={(checked) => setValue("send_later", checked)} />
              <label className="text-sm font-medium">Send later</label>
              <InfoTooltip text="Leave off to send right away, or pick a future date and time to queue this broadcast." />
            </div>
            {sendLater && (
              <div>
                <Input type="datetime-local" {...register("scheduled_at_local")} />
                {errors.scheduled_at_local && (
                  <p className="mt-1 text-xs text-destructive">{errors.scheduled_at_local.message}</p>
                )}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full gap-2" disabled={broadcastMutation.isPending}>
            {broadcastMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {sendLater ? "Schedule Broadcast" : "Send Broadcast"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            This can't be undone once sent — double-check everything first.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
