"use client";

import { useEffect, useRef } from "react";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ImagePlus, Loader2, Plus, SendHorizonal, Trash2, X } from "lucide-react";
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
  createTemplateSchema,
  bodyVariableCount,
  whatsappService,
  EMPTY_CREATE_TEMPLATE_VALUES,
  type CreateTemplateFormValues,
} from "./whatsapp";

const SELECT_CLASS =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const CATEGORY_OPTIONS: { value: CreateTemplateFormValues["category"]; label: string; help: string }[] = [
  {
    value: "UTILITY",
    label: "Utility",
    help: "Transactional updates the patient is expecting — appointment confirmations, reminders, receipts.",
  },
  {
    value: "MARKETING",
    label: "Marketing",
    help: "Offers, reactivation nudges, announcements — anything promotional. Meta reviews these more strictly.",
  },
  {
    value: "AUTHENTICATION",
    label: "Authentication (OTP)",
    help: "One-time verification codes only. Meta writes the message text itself — you only set the expiry time.",
  },
];

const HEADER_TYPE_OPTIONS: { value: CreateTemplateFormValues["header_type"]; label: string }[] = [
  { value: "NONE", label: "No header" },
  { value: "TEXT", label: "Text header" },
  { value: "IMAGE", label: "Image header" },
];

const BUTTON_TYPE_LABELS: Record<CreateTemplateFormValues["buttons"][number]["type"], string> = {
  QUICK_REPLY: "Quick Reply",
  URL: "Website URL",
  PHONE_NUMBER: "Call phone number",
};

interface CreateTemplateFormCardProps {
  onCreated: (requestId: string) => void;
}

export function CreateTemplateFormCard({ onCreated }: CreateTemplateFormCardProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateTemplateFormValues>({
    resolver: zodResolver(createTemplateSchema) as unknown as Resolver<CreateTemplateFormValues>,
    defaultValues: EMPTY_CREATE_TEMPLATE_VALUES,
  });

  const { fields: buttonFields, append: appendButton, remove: removeButton } = useFieldArray({
    control,
    name: "buttons",
  });

  const category = watch("category");
  const headerType = watch("header_type");
  const headerText = watch("header_text");
  const headerImage = watch("header_image");
  const bodyText = watch("body_text") ?? "";
  const sampleValues = watch("body_sample_values");
  const footerText = watch("footer_text");
  const buttons = watch("buttons");
  const authAddSecurityRecommendation = watch("auth_add_security_recommendation");
  const authCodeExpirationMinutes = watch("auth_code_expiration_minutes");

  const variableCount = bodyVariableCount(bodyText);

  useEffect(() => {
    setValue(
      "body_sample_values",
      Array.from({ length: variableCount }, (_, i) => sampleValues[i] ?? "")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the placeholder count itself changes
  }, [variableCount]);

  const createMutation = useMutation({
    mutationFn: (values: CreateTemplateFormValues) => whatsappService.createTemplateRequest(values),
    onSuccess: (res) => {
      toast.success(res.msg, "It'll show up below once Meta reviews it — usually within a day.");
      onCreated(res.data.request_id);
      reset(EMPTY_CREATE_TEMPLATE_VALUES);
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const onSubmit = handleSubmit((values) => createMutation.mutate(values));

  const previewBody = bodyText.replace(/\{\{(\d+)\}\}/g, (match, n) => sampleValues[Number(n) - 1] || match);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <SendHorizonal className="h-4 w-4" /> Request New Template
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 flex items-center gap-1.5">
                <label className="text-sm font-medium">Template name</label>
                <InfoTooltip text="Internal name Meta uses to identify this template. Lowercase letters, numbers, and underscores only — e.g. appointment_reminder." />
              </div>
              <Input placeholder="appointment_reminder" {...register("name")} />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div>
              <div className="mb-1.5 flex items-center gap-1.5">
                <label className="text-sm font-medium">Language</label>
                <InfoTooltip text="The language code Meta should review this in, e.g. en_US for English or hi for Hindi." />
              </div>
              <Input placeholder="en_US" {...register("language")} />
              {errors.language && <p className="mt-1 text-xs text-destructive">{errors.language.message}</p>}
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <label className="text-sm font-medium">Category</label>
              <InfoTooltip text="What kind of message this is — Meta reviews each category with different rules. Pick Authentication only for OTP/verification codes." />
            </div>
            <select className={SELECT_CLASS} {...register("category")}>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              {CATEGORY_OPTIONS.find((c) => c.value === category)?.help}
            </p>
          </div>

          {category === "AUTHENTICATION" ? (
            <div className="space-y-4 rounded-lg border border-dashed border-border p-3">
              <p className="text-xs text-muted-foreground">
                Meta writes the OTP message text itself (e.g. &quot;123456 is your verification code&quot;) — you
                only choose how long the code stays valid and whether to show a security warning.
              </p>
              <div>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <label className="text-sm font-medium">Code expires after (minutes)</label>
                  <InfoTooltip text="How long the OTP stays valid once sent — after this, the patient must request a new one." />
                </div>
                <Input
                  type="number"
                  min={1}
                  max={90}
                  className="max-w-[10rem]"
                  {...register("auth_code_expiration_minutes")}
                />
                {errors.auth_code_expiration_minutes && (
                  <p className="mt-1 text-xs text-destructive">{errors.auth_code_expiration_minutes.message}</p>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <Switch
                  checked={authAddSecurityRecommendation}
                  onCheckedChange={(checked) => setValue("auth_add_security_recommendation", checked)}
                />
                <label className="text-sm">Show &quot;don&apos;t share this code&quot; warning</label>
                <InfoTooltip text="Adds a standard security line reminding the patient never to share their OTP with anyone." />
              </div>
            </div>
          ) : (
            <>
              <div>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <label className="text-sm font-medium">Header</label>
                  <InfoTooltip text="Optional line shown above the message — plain text, or an image. Leave as 'No header' if you don't need one." />
                </div>
                <select className={cn(SELECT_CLASS, "max-w-xs")} {...register("header_type")}>
                  {HEADER_TYPE_OPTIONS.map((h) => (
                    <option key={h.value} value={h.value}>
                      {h.label}
                    </option>
                  ))}
                </select>
                {headerType === "TEXT" && (
                  <div className="mt-2">
                    <Input placeholder="e.g. Appointment Confirmed" {...register("header_text")} />
                    {errors.header_text && <p className="mt-1 text-xs text-destructive">{errors.header_text.message}</p>}
                  </div>
                )}
                {headerType === "IMAGE" && (
                  <div className="mt-2">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={(e) =>
                        setValue("header_image", e.target.files?.[0] ?? null, { shouldValidate: true })
                      }
                    />
                    <Button type="button" size="sm" variant="outline" className="gap-2" onClick={() => imageInputRef.current?.click()}>
                      <ImagePlus className="h-4 w-4" />
                      {headerImage ? "Change image" : "Choose image"}
                    </Button>
                    {headerImage && (
                      <div className="mt-1.5 flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1 text-xs">
                        <span className="truncate">{headerImage.name}</span>
                        <button
                          type="button"
                          onClick={() => setValue("header_image", null, { shouldValidate: true })}
                          className="ml-auto shrink-0"
                          aria-label="Remove image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">JPEG or PNG, up to 5MB.</p>
                    {errors.header_image && <p className="mt-1 text-xs text-destructive">{errors.header_image.message}</p>}
                  </div>
                )}
              </div>

              <div>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <label className="text-sm font-medium">Body text</label>
                  <InfoTooltip text="The main message. Use {{1}}, {{2}} etc. for parts that change per patient — like their name or an appointment time." />
                </div>
                <Textarea rows={3} placeholder="Hi {{1}}, your appointment is on {{2}}." {...register("body_text")} />
                {errors.body_text && <p className="mt-1 text-xs text-destructive">{errors.body_text.message}</p>}
              </div>

              {variableCount > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <label className="block text-sm font-medium">Sample values ({variableCount})</label>
                    <InfoTooltip text="Meta needs a realistic example for each {{n}} to review the template — these examples aren't sent to patients, real values fill in later." />
                  </div>
                  {Array.from({ length: variableCount }).map((_, i) => (
                    <Input
                      key={i}
                      placeholder={`Example for {{${i + 1}}}`}
                      value={sampleValues[i] ?? ""}
                      onChange={(e) => {
                        const next = [...sampleValues];
                        next[i] = e.target.value;
                        setValue("body_sample_values", next);
                      }}
                    />
                  ))}
                  {errors.body_sample_values && (
                    <p className="text-xs text-destructive">{errors.body_sample_values.message as string}</p>
                  )}
                </div>
              )}

              <div>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <label className="text-sm font-medium">Footer (optional)</label>
                  <InfoTooltip text="Small grey line under the message — e.g. a clinic name or tagline. Can't contain {{n}} variables." />
                </div>
                <Input placeholder="MR Dental Clinic" {...register("footer_text")} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <label className="block text-sm font-medium">Buttons (optional)</label>
                  <InfoTooltip text="Up to 3 tappable buttons under the message: Quick Reply (sends a reply back to us), a website link, or a call button. Only one URL and one call button allowed." />
                </div>
                {buttonFields.map((field, index) => (
                  <div key={field.id} className="flex flex-wrap items-start gap-2 rounded-lg border border-border p-2.5">
                    <select className={cn(SELECT_CLASS, "w-40")} {...register(`buttons.${index}.type` as const)}>
                      {(Object.keys(BUTTON_TYPE_LABELS) as (keyof typeof BUTTON_TYPE_LABELS)[]).map((t) => (
                        <option key={t} value={t}>
                          {BUTTON_TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                    <Input
                      className="w-40"
                      placeholder="Button text"
                      {...register(`buttons.${index}.text` as const)}
                    />
                    {buttons[index]?.type === "URL" && (
                      <Input
                        className="min-w-[10rem] flex-1"
                        placeholder="https://..."
                        {...register(`buttons.${index}.url` as const)}
                      />
                    )}
                    {buttons[index]?.type === "PHONE_NUMBER" && (
                      <Input
                        className="min-w-[10rem] flex-1"
                        placeholder="+919876543210"
                        {...register(`buttons.${index}.phone_number` as const)}
                      />
                    )}
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeButton(index)} aria-label="Remove button">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {errors.buttons?.[index]?.text && (
                      <p className="w-full text-xs text-destructive">{errors.buttons[index]?.text?.message}</p>
                    )}
                  </div>
                ))}
                {typeof errors.buttons?.message === "string" && (
                  <p className="text-xs text-destructive">{errors.buttons.message}</p>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  disabled={buttonFields.length >= 3}
                  onClick={() => appendButton({ type: "QUICK_REPLY", text: "", url: "", phone_number: "" })}
                >
                  <Plus className="h-3.5 w-3.5" /> Add button
                </Button>
              </div>
            </>
          )}

          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Live preview</p>
            <div className="mx-auto max-w-[280px] rounded-lg bg-[#dcf8c6] p-2.5 text-sm text-neutral-900 shadow-sm dark:bg-emerald-900/60 dark:text-neutral-50">
              {category === "AUTHENTICATION" ? (
                <>
                  <p>*123456* is your verification code.</p>
                  {authAddSecurityRecommendation && (
                    <p className="mt-1 text-xs opacity-80">For your security, do not share this code.</p>
                  )}
                  <p className="mt-1 text-xs opacity-80">
                    This code expires in {authCodeExpirationMinutes || 5} minutes.
                  </p>
                  <div className="mt-2 border-t border-black/10 pt-1.5 text-center text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    Copy Code
                  </div>
                </>
              ) : (
                <>
                  {headerType === "TEXT" && headerText && <p className="mb-1 font-semibold">{headerText}</p>}
                  {headerType === "IMAGE" && headerImage && (
                    <div className="mb-1.5 flex h-28 items-center justify-center rounded-md bg-black/10 text-xs text-muted-foreground">
                      {headerImage.name}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{previewBody || "Body text will appear here…"}</p>
                  {footerText && <p className="mt-1 text-xs opacity-70">{footerText}</p>}
                  {buttons.length > 0 && (
                    <div className="mt-2 space-y-1 border-t border-black/10 pt-1.5">
                      {buttons.map((b, i) => (
                        <div key={i} className="text-center text-xs font-medium text-emerald-700 dark:text-emerald-300">
                          {b.text || "Button"}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit for Meta Review
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
