"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";
import { APPT_UI } from "@/src/features/appointments/StatusBadge";
import { templateVariableCount, whatsappService, type ApiTemplate } from "@/src/features/whatsapp/whatsapp";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fills {{1}} - most templates start with the patient's name. */
  patientName?: string | null;
  sending: boolean;
  onSend: (template: ApiTemplate, variables: string[]) => void;
}

function fill(text: string | undefined, values: string[]): string {
  return (text ?? "").replace(/\{\{(\d+)\}\}/g, (m, n) => values[Number(n) - 1] || m);
}

/** Approved Meta templates only - the one thing that can be sent once the 24h window has closed. */
export function TemplatePickerDialog({ open, onOpenChange, patientName, sending, onSend }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["whatsapp", "templates", "APPROVED"],
    queryFn: async () => (await whatsappService.listTemplates("APPROVED")).data.templates,
    enabled: open,
    staleTime: 5 * 60_000,
  });
  const templates = useMemo(
    () => (data ?? []).filter((t) => t.category !== "AUTHENTICATION").sort((a, b) => a.name.localeCompare(b.name)),
    [data]
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [values, setValues] = useState<string[]>([]);
  const selected = templates.find((t) => t.id === selectedId) ?? null;
  const count = selected ? templateVariableCount(selected) : 0;

  const choose = (t: ApiTemplate) => {
    setSelectedId(t.id);
    const n = templateVariableCount(t);
    setValues(Array.from({ length: n }, (_, i) => (i === 0 && patientName ? patientName : "")));
  };

  const body = selected?.components.find((c) => c.type === "BODY")?.text;
  const header = selected?.components.find((c) => c.type === "HEADER" && c.format === "TEXT")?.text;
  const footer = selected?.components.find((c) => c.type === "FOOTER")?.text;
  const buttons = selected?.components.find((c) => c.type === "BUTTONS")?.buttons ?? [];
  const ready = selected && values.length === count && values.every((v) => v.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send a template</DialogTitle>
          <DialogDescription>Pre-approved WhatsApp messages. They can be sent even after the 24-hour reply window closes.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
          <ul className="max-h-[50vh] space-y-1 overflow-y-auto" aria-label="Templates">
            {isLoading && <li className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading…</li>}
            {!isLoading && !templates.length && <li className="text-sm text-muted-foreground">No approved templates yet.</li>}
            {templates.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => choose(t)}
                  className={cn(
                    "w-full rounded-md px-2.5 py-2 text-left text-sm hover:bg-muted",
                    selectedId === t.id && "bg-[#1F7A4A]/10 font-medium text-[#1F7A4A] dark:bg-primary/15 dark:text-primary"
                  )}
                >
                  {t.name}
                  <span className="ml-1.5 text-xs text-muted-foreground">{t.language}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="min-w-0 space-y-3">
            {!selected ? (
              <p className="text-sm text-muted-foreground">Choose a template on the left.</p>
            ) : (
              <>
                {Array.from({ length: count }).map((_, i) => (
                  <label key={i} className="block text-sm">
                    <span className="text-muted-foreground">{`{{${i + 1}}}`}</span>
                    <Input
                      value={values[i] ?? ""}
                      onChange={(e) => setValues((v) => v.map((x, j) => (j === i ? e.target.value : x)))}
                      aria-label={`Variable ${i + 1}`}
                    />
                  </label>
                ))}
                <div className="rounded-lg bg-[#ECE5DD] p-3 dark:bg-muted/40" aria-label="Preview">
                  <div className="ml-auto max-w-[90%] whitespace-pre-wrap rounded-lg rounded-tr-none bg-[#DCF8C6] p-3 text-sm text-[#17261F] shadow-sm dark:bg-[#1F4D33] dark:text-emerald-50" data-testid="template-preview">
                    {header && <p className="font-semibold">{header}</p>}
                    {fill(body, values)}
                    {footer && <p className="mt-1 text-xs text-muted-foreground">{footer}</p>}
                    {buttons.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {buttons.map((b, i) => <span key={i} className="rounded-full border border-[#1F7A4A]/30 px-2 py-0.5 text-xs text-[#1F7A4A]">{b.text}</span>)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button className={APPT_UI.primaryButton} disabled={!ready || sending} onClick={() => selected && onSend(selected, values.map((v) => v.trim()))}>
                    {sending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}Send template
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
