"use client";

import { useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { toast } from "@/src/lib/toast";
import { cn } from "@/src/lib/utils";
import type { NormalizedApiError } from "@/src/types/api";
import { APPT_UI } from "@/src/features/appointments/StatusBadge";
import { PhonePreview } from "./PhonePreview";
import {
  LANGUAGE_LABEL,
  LIMITS,
  MAIN_LANGUAGES,
  reasonLabel,
  templateDetailKey,
  templatesService,
  TEMPLATES_PAGE_KEY,
  toTemplateName,
  validateDraft,
  variableNumbers,
  type TemplateDraft,
  type TemplateRow,
} from "./templates";

export type FormSeed = Partial<TemplateDraft> & { rejectionReason?: string | null };

const EMPTY_LANG = { header: "", body: "", footer: "", samples: [] as string[] };
const FIELD = "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function initialDraft(seed?: FormSeed): TemplateDraft {
  const languages = seed?.languages?.length ? seed.languages : [...MAIN_LANGUAGES];
  return {
    friendlyName: seed?.friendlyName ?? "",
    name: seed?.name ?? "",
    messageType: seed?.messageType ?? "",
    category: seed?.category ?? "UTILITY",
    languages,
    perLanguage: Object.fromEntries(
      [...new Set([...MAIN_LANGUAGES, ...languages])].map((l) => [l, { ...EMPTY_LANG, ...(seed?.perLanguage?.[l] ?? {}) }])
    ),
    buttons: seed?.buttons ?? [],
    variableKeys: seed?.variableKeys ?? [],
  };
}

interface Props {
  open: boolean;
  seed?: FormSeed;
  /** System rows, for "Message type it replaces". */
  messageTypes: Pick<TemplateRow, "key" | "name">[];
  onClose: () => void;
}

export function TemplateFormDrawer({ open, seed, messageTypes, onClose }: Props) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-card text-card-foreground shadow-2xl focus:outline-none sm:max-w-[1120px] sm:border-l sm:border-[#E3E9E5] sm:dark:border-border"
        >
          {open && <FormBody seed={seed} messageTypes={messageTypes} onClose={onClose} />}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function FormBody({ seed, messageTypes, onClose }: Omit<Props, "open">) {
  const queryClient = useQueryClient();
  const [d, setD] = useState<TemplateDraft>(() => initialDraft(seed));
  const [nameEdited, setNameEdited] = useState(Boolean(seed?.name));
  const [previewLang, setPreviewLang] = useState<string>(d.languages[0] ?? "hi");
  const [tried, setTried] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // The message type's allowed variables, sample values and next version name.
  const { data: typeDetail } = useQuery({
    queryKey: templateDetailKey(d.messageType || "-"),
    queryFn: async () => (await templatesService.detail(d.messageType)).data,
    enabled: Boolean(d.messageType),
    staleTime: 120_000,
  });

  const maxVars = Math.max(0, ...d.languages.map((l) => variableNumbers(d.perLanguage[l].body).length));
  const { errors, warnings } = useMemo(() => validateDraft(d), [d]);
  const set = (patch: Partial<TemplateDraft>) => setD((prev) => ({ ...prev, ...patch }));
  const setLang = (lang: string, patch: Partial<TemplateDraft["perLanguage"][string]>) =>
    setD((prev) => ({ ...prev, perLanguage: { ...prev.perLanguage, [lang]: { ...prev.perLanguage[lang], ...patch } } }));

  const pickMessageType = (key: string) => {
    set({ messageType: key, variableKeys: key ? d.variableKeys : [] });
    if (key && !nameEdited) setNameEdited(false);
  };
  const autoName = d.messageType && typeDetail?.next_version_name && !nameEdited ? typeDetail.next_version_name : null;
  const effective: TemplateDraft = autoName ? { ...d, name: autoName } : d;

  const setVariableKey = (index: number, key: string) => {
    const keys = [...d.variableKeys];
    keys[index] = key;
    const sample = key ? typeDetail?.sample_values[key] ?? "" : "";
    setD((prev) => ({
      ...prev,
      variableKeys: keys,
      perLanguage: Object.fromEntries(
        Object.entries(prev.perLanguage).map(([l, v]) => {
          const samples = [...v.samples];
          if (sample) samples[index] = sample;
          return [l, { ...v, samples }];
        })
      ),
    }));
  };

  const submit = async () => {
    setTried(true);
    const check = validateDraft(effective);
    if (check.errors.length || submitting) return;
    setSubmitting(true);
    const failed: string[] = [];
    for (const lang of effective.languages) {
      try {
        await templatesService.submitLanguage(effective, lang);
      } catch (err) {
        const e = err as NormalizedApiError;
        failed.push(`${LANGUAGE_LABEL[lang] ?? lang}: ${e.msg ?? e.error}`);
      }
    }
    setSubmitting(false);
    await queryClient.invalidateQueries({ queryKey: TEMPLATES_PAGE_KEY });
    if (failed.length) {
      toast.error("Not everything was submitted", failed.join(" · "));
      return;
    }
    toast.success("Submitted to Meta", `${effective.name} — approval usually takes minutes to a day.`);
    onClose();
  };

  const previewContent = {
    header: d.perLanguage[previewLang]?.header || null,
    body: d.perLanguage[previewLang]?.body || null,
    footer: d.perLanguage[previewLang]?.footer || null,
    buttons: d.buttons.filter((b) => b.text).map((b) => ({ type: b.type, text: b.text, url: b.url })),
  };

  return (
    <>
      <header className="flex items-start justify-between gap-3 border-b border-[#E3E9E5] p-5 dark:border-border sm:px-6">
        <div>
          <DialogPrimitive.Title className={cn("text-2xl font-semibold tracking-tight", APPT_UI.ink)}>
            {seed?.rejectionReason ? "Fix & resubmit" : seed?.name ? "Duplicate as new" : "New template"}
          </DialogPrimitive.Title>
          <p className="mt-1 text-sm text-muted-foreground">Both languages are submitted to Meta together. Meta reviews each one.</p>
        </div>
        <DialogPrimitive.Close className="-mr-1 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5 text-sm">
          {seed?.rejectionReason && (
            <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p><span className="font-semibold">Meta&apos;s reason: </span>{reasonLabel(seed.rejectionReason)}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Friendly name" htmlFor="tf-friendly">
              <Input id="tf-friendly" value={d.friendlyName} onChange={(e) => {
                const friendlyName = e.target.value;
                set({ friendlyName, ...(nameEdited || d.messageType ? {} : { name: toTemplateName(friendlyName) }) });
              }} placeholder="e.g. Diwali clinic timings" />
            </Field>
            <Field label="Template name" htmlFor="tf-name" hint="lowercase_with_underscores — Meta's id, can't be reused">
              <Input id="tf-name" value={effective.name} onChange={(e) => { setNameEdited(true); set({ name: e.target.value.toLowerCase() }); }} />
            </Field>
            <Field label="Message type it replaces (optional)" htmlFor="tf-type">
              <select id="tf-type" className={FIELD} value={d.messageType} onChange={(e) => pickMessageType(e.target.value)}>
                <option value="">None — a new custom template</option>
                {messageTypes.map((m) => <option key={m.key} value={m.key}>{m.name}</option>)}
              </select>
            </Field>
            <Field label="Category" htmlFor="tf-category">
              <select id="tf-category" className={FIELD} value={d.category} onChange={(e) => set({ category: e.target.value as TemplateDraft["category"] })}>
                <option value="UTILITY">Utility — about an existing appointment/visit</option>
                <option value="MARKETING">Marketing — offers, reviews, promotions</option>
              </select>
            </Field>
          </div>

          <fieldset>
            <legend className="mb-1.5 font-medium">Languages</legend>
            <div className="flex gap-4">
              {MAIN_LANGUAGES.map((l) => (
                <label key={l} className="flex items-center gap-2">
                  <input type="checkbox" checked={d.languages.includes(l)} onChange={(e) => {
                    const languages = e.target.checked ? [...d.languages, l] : d.languages.filter((x) => x !== l);
                    set({ languages: MAIN_LANGUAGES.filter((x) => languages.includes(x)) });
                    if (e.target.checked) setPreviewLang(l);
                  }} />
                  {LANGUAGE_LABEL[l]}
                </label>
              ))}
            </div>
          </fieldset>

          <div className={cn("grid grid-cols-1 gap-4", d.languages.length === 2 && "xl:grid-cols-2")}>
            {d.languages.map((lang) => {
              const l = d.perLanguage[lang];
              const nums = variableNumbers(l.body);
              return (
                <section key={lang} className="min-w-0 space-y-3 rounded-lg border border-border p-3" onFocus={() => setPreviewLang(lang)}>
                  <h3 className="font-semibold">{LANGUAGE_LABEL[lang]}</h3>
                  <Field label="Header (optional)" htmlFor={`tf-h-${lang}`} hint={`${l.header.length}/${LIMITS.header}`}>
                    <Input id={`tf-h-${lang}`} value={l.header} onChange={(e) => setLang(lang, { header: e.target.value })} />
                  </Field>
                  <Field label="Message" htmlFor={`tf-b-${lang}`} hint={`${l.body.length}/${LIMITS.body} · use {{1}}, {{2}} for values filled in per patient`}>
                    <Textarea id={`tf-b-${lang}`} rows={7} value={l.body} onChange={(e) => setLang(lang, { body: e.target.value })} />
                  </Field>
                  <Field label="Footer (optional)" htmlFor={`tf-f-${lang}`} hint={`${l.footer.length}/${LIMITS.footer}`}>
                    <Input id={`tf-f-${lang}`} value={l.footer} onChange={(e) => setLang(lang, { footer: e.target.value })} />
                  </Field>
                  {nums.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium">Sample values (Meta needs one per variable)</p>
                      {nums.map((n) => (
                        <div key={n} className="flex items-center gap-2">
                          <code className="w-10 shrink-0 rounded bg-muted px-1 py-0.5 text-center text-xs">{`{{${n}}}`}</code>
                          <Input aria-label={`Sample for {{${n}}} (${LANGUAGE_LABEL[lang]})`} value={l.samples[n - 1] ?? ""}
                                 onChange={(e) => { const samples = [...l.samples]; samples[n - 1] = e.target.value; setLang(lang, { samples }); }} />
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {d.messageType && maxVars > 0 && (
            <fieldset className="space-y-2">
              <legend className="mb-1 font-medium">What each variable means</legend>
              {Array.from({ length: maxVars }, (_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <code className="w-10 shrink-0 rounded bg-muted px-1 py-0.5 text-center text-xs">{`{{${i + 1}}}`}</code>
                  <select aria-label={`Meaning of {{${i + 1}}}`} className={FIELD} value={d.variableKeys[i] ?? ""} onChange={(e) => setVariableKey(i, e.target.value)}>
                    <option value="">Choose…</option>
                    {(typeDetail?.allowed_variables ?? []).map((v) => <option key={v.key} value={v.key}>{v.label}</option>)}
                  </select>
                </div>
              ))}
            </fieldset>
          )}

          <fieldset className="space-y-2">
            <legend className="mb-1 font-medium">Buttons (optional, up to 3)</legend>
            {d.buttons.map((b, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <select aria-label="Button type" className={cn(FIELD, "w-36")} value={b.type}
                        onChange={(e) => set({ buttons: d.buttons.map((x, j) => (j === i ? { ...x, type: e.target.value as "URL" | "QUICK_REPLY" } : x)) })}>
                  <option value="QUICK_REPLY">Quick reply</option>
                  <option value="URL">Link (URL)</option>
                </select>
                <Input aria-label="Button text" className="w-48" value={b.text} maxLength={LIMITS.button} placeholder="Button text"
                       onChange={(e) => set({ buttons: d.buttons.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} />
                {b.type === "URL" && (
                  <Input aria-label="Button URL" className="min-w-48 flex-1" value={b.url} placeholder="https://…"
                         onChange={(e) => set({ buttons: d.buttons.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} />
                )}
                <Button type="button" size="icon" variant="ghost" aria-label="Remove button" onClick={() => set({ buttons: d.buttons.filter((_, j) => j !== i) })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {d.buttons.length < 3 && (
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => set({ buttons: [...d.buttons, { type: "QUICK_REPLY", text: "", url: "" }] })}>
                <Plus className="h-4 w-4" /> Add button
              </Button>
            )}
          </fieldset>

          {(tried || warnings.length > 0) && (errors.length > 0 || warnings.length > 0) && (
            <div className="space-y-1" aria-live="polite">
              {tried && errors.map((e) => <p key={e} className="text-red-700 dark:text-red-400">• {e}</p>)}
              {warnings.map((w) => <p key={w} className="text-amber-700 dark:text-amber-300">⚠ {w}</p>)}
            </div>
          )}
        </div>

        <aside className="space-y-2 lg:sticky lg:top-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">Live preview</h3>
            <div className="flex gap-1">
              {d.languages.map((l) => (
                <button key={l} type="button" onClick={() => setPreviewLang(l)}
                        className={cn("rounded-md px-2 py-0.5 text-xs", previewLang === l ? "bg-foreground text-background" : "hover:bg-muted")}>
                  {LANGUAGE_LABEL[l]}
                </button>
              ))}
            </div>
          </div>
          <PhonePreview content={previewContent} sampleValues={d.perLanguage[previewLang]?.samples ?? []}
                        clinicName={typeDetail?.clinic_name ?? "MR Dental Clinic"} emptyText="Start typing the message" />
        </aside>
      </div>

      <footer className="flex items-center justify-end gap-2 border-t border-[#E3E9E5] p-4 dark:border-border sm:px-6">
        {tried && errors.length > 0 && <p className="mr-auto text-sm text-red-700 dark:text-red-400">{errors.length} thing{errors.length === 1 ? "" : "s"} to fix</p>}
        <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button className={APPT_UI.primaryButton} onClick={submit} disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit to Meta
        </Button>
      </footer>
    </>
  );
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={htmlFor} className="mb-1 block font-medium">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
