import { z } from "zod";
import { http } from "@/src/services/http";
import { apiClient } from "@/src/services/api-client";
import { API_ENDPOINTS } from "@/src/config/endpoints";

// ---------- Types ----------

export type MessageDirection = "inbound" | "outbound" | "system" | "internal";

export type MessageStatus = "delivered" | "read" | "sent" | "failed" | "system" | "internal";

export type MessageType =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "document"
  | "sticker"
  | "location"
  | "button"
  | "interactive"
  | "template"
  | "system_event";

export interface SentBy {
  role: "bot" | "patient" | "staff" | "system";
  user_id: string | null;
  name: string | null;
}

/**
 * Shape varies by `message_type` (see WHATSAPP_INBOX_API.md §3) — every field
 * here is optional and callers narrow by `message_type` before reading.
 */
export interface MessageContent {
  text?: string;
  buttons?: { id: string; title: string }[];
  sections?: { title: string; rows: { id: string; title: string }[] }[];
  selected_id?: string;
  media_id?: string;
  media_url?: string;
  caption?: string | null;
  mime_type?: string;
  latitude?: number;
  longitude?: number;
  template_name?: string;
  language?: string;
  variables?: string[];
  broadcast_job_id?: string | null;
  raw?: unknown;
}

export interface ApiMessage {
  id: string;
  conversation_id: string;
  direction: MessageDirection;
  message_type: MessageType;
  content: MessageContent;
  wa_message_id: string | null;
  status: MessageStatus;
  sent_by: SentBy;
  is_internal_note: boolean;
  error_reason: string | null;
  /** Pre-formatted IST display string "DD-MM-YYYY HH:MM" — do not parse as epoch. */
  created_at: string;
}

export interface ConversationAssignee {
  user_id: string;
  name: string;
}

export interface ApiConversation {
  conversation_id: string;
  phone: string;
  patient_id: string | null;
  patient_name: string | null;
  /** The sender's own WhatsApp display name (from Meta's webhook `contacts`
   * payload) — set even when they're not a registered patient. Use as the
   * fallback display name before falling back further to `phone`. */
  contact_name: string | null;
  last_message_preview: string;
  /** Pre-formatted IST display string. */
  last_message_time: string;
  last_message_direction: MessageDirection;
  unread_count: number;
  human_mode: boolean;
  assigned_to: ConversationAssignee | null;
  tags: string[];
}

export type AuditLogAction =
  | "takeover"
  | "release"
  | "note_added"
  | "message_sent"
  | "tags_updated"
  | "export"
  | "message_retry"
  | "template_sync"
  | "broadcast_created"
  | "template_request_created"
  | "template_status_update"
  | "template_request_retried";

export interface RawApiAuditLog {
  _id: string;
  conversation_id: string | null;
  action: AuditLogAction;
  actor_user_id: string;
  actor_name: string;
  details: Record<string, unknown>;
  /** Pre-formatted IST display string. */
  created_at: string;
}

export interface ApiAuditLog {
  id: string;
  conversation_id: string | null;
  action: AuditLogAction;
  actor_user_id: string;
  actor_name: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface TemplateComponent {
  type: string;
  format?: string;
  text?: string;
  buttons?: { type: string; text: string; url?: string; phone_number?: string }[];
}

export interface RawApiTemplate {
  _id: string;
  name: string;
  language: string;
  meta_template_id: string;
  category: string;
  status: string;
  components: TemplateComponent[];
  /** Epoch ms — use this, not `created_at` (always null on templates). */
  synced_at: number;
  created_at: null;
}

export interface ApiTemplate {
  id: string;
  name: string;
  language: string;
  meta_template_id: string;
  category: string;
  status: string;
  components: TemplateComponent[];
  synced_at: number;
}

/** Body's `{{n}}` placeholders — the personalizable-per-recipient part. */
export function templateVariableCount(template: Pick<ApiTemplate, "components">): number {
  const body = template.components.find((c) => c.type === "BODY");
  const matches = body?.text?.match(/\{\{\d+\}\}/g);
  return matches ? new Set(matches).size : 0;
}

/** A TEXT header can carry exactly one dynamic {{1}} (Meta never allows more
 * than one header variable); an IMAGE header is always static, never {{n}}. */
export function templateHasHeaderVariable(template: Pick<ApiTemplate, "components">): boolean {
  const header = template.components.find((c) => c.type === "HEADER");
  return header?.format === "TEXT" && /\{\{1\}\}/.test(header.text ?? "");
}

/** A template can have at most one URL button, and only that button type
 * supports a dynamic {{1}} suffix (Quick Reply / Phone Number never do). */
export function templateHasButtonVariable(template: Pick<ApiTemplate, "components">): boolean {
  const buttonsComponent = template.components.find((c) => c.type === "BUTTONS");
  return (buttonsComponent?.buttons ?? []).some((b) => b.type === "URL" && /\{\{1\}\}/.test(b.url ?? ""));
}

// ---------- Template requests (submit a new template to Meta) ----------

export type TemplateCategory = "MARKETING" | "UTILITY" | "AUTHENTICATION";
export type TemplateHeaderType = "NONE" | "TEXT" | "IMAGE";
export type TemplateButtonType = "QUICK_REPLY" | "URL" | "PHONE_NUMBER";
export type TemplateRequestStatus = "SUBMITTING" | "PENDING" | "APPROVED" | "REJECTED" | "SUBMIT_FAILED";

export interface TemplateButtonInput {
  type: TemplateButtonType;
  text: string;
  url?: string;
  phone_number?: string;
}

export interface TemplateAuthConfig {
  otp_type: "COPY_CODE";
  code_expiration_minutes: number;
  add_security_recommendation: boolean;
}

export interface TemplateHeader {
  type: TemplateHeaderType;
  text: string | null;
  header_handle: string | null;
}

export interface RawApiTemplateRequest {
  _id: string;
  name: string;
  language: string;
  category: TemplateCategory;
  header: TemplateHeader;
  body_text: string | null;
  body_sample_values: string[];
  footer_text: string | null;
  buttons: TemplateButtonInput[];
  auth_config: TemplateAuthConfig | null;
  meta_template_id: string | null;
  status: TemplateRequestStatus;
  rejected_reason: string | null;
  submit_error: string | null;
  created_by: { user_id: string; name: string };
  /** Pre-formatted IST display string. */
  created_at: string;
}

export interface ApiTemplateRequest {
  id: string;
  name: string;
  language: string;
  category: TemplateCategory;
  header: TemplateHeader;
  body_text: string | null;
  body_sample_values: string[];
  footer_text: string | null;
  buttons: TemplateButtonInput[];
  auth_config: TemplateAuthConfig | null;
  meta_template_id: string | null;
  status: TemplateRequestStatus;
  rejected_reason: string | null;
  submit_error: string | null;
  created_by: { user_id: string; name: string };
  created_at: string;
}

/** Live `{{n}}` placeholder count straight from a text field, for detecting
 * variables as the admin types the body — templateVariableCount above only
 * works on an already-synced ApiTemplate's `components`. */
export function bodyVariableCount(bodyText: string): number {
  const matches = bodyText.match(/\{\{\d+\}\}/g);
  return matches ? new Set(matches).size : 0;
}

export type BroadcastJobStatus = "scheduled" | "pending" | "running" | "completed";

export interface BroadcastFailure {
  phone: string;
  reason: string;
}

export interface RawApiBroadcastJob {
  _id: string;
  template_name: string;
  language: string;
  variables: string[];
  total: number;
  sent_count: number;
  failed_count: number;
  failures: BroadcastFailure[];
  status: BroadcastJobStatus;
  created_by: { user_id: string; name: string };
  /** Epoch ms or null — set once send starts (never, for a still-scheduled job). */
  started_at: number | null;
  /** Epoch ms or null. */
  completed_at: number | null;
  /** Epoch ms or null — when a "send later" job is due. */
  scheduled_at: number | null;
  /** Pre-formatted IST display string. */
  created_at: string;
}

export interface ApiBroadcastJob {
  id: string;
  template_name: string;
  language: string;
  variables: string[];
  total: number;
  sent_count: number;
  failed_count: number;
  failures: BroadcastFailure[];
  status: BroadcastJobStatus;
  created_by: { user_id: string; name: string };
  started_at: number | null;
  completed_at: number | null;
  scheduled_at: number | null;
  created_at: string;
}

export interface BroadcastFilter {
  all_patients?: boolean;
  inactive_since_days?: number;
}

export interface BroadcastRecipientPersonalized {
  phone: string;
  variables: string[];
}

export interface CreateBroadcastPayload {
  template_name: string;
  language?: string;
  variables?: string[];
  header_variables?: string[];
  button_variables?: string[];
  phones?: string[] | null;
  filter?: BroadcastFilter | null;
  recipients?: BroadcastRecipientPersonalized[] | null;
  scheduled_at?: number | null;
}

export interface ConversationListParams {
  unread_only?: boolean;
  human_mode?: boolean;
  search?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}

// ---------- Timestamp helpers ----------
// message.created_at / conversation.last_message_time are pre-formatted IST
// display strings "DD-MM-YYYY HH:MM" (see WHATSAPP_INBOX_API.md §3) — never epoch.

const DISPLAY_TIMESTAMP_RE = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/;
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

export function parseIstDisplayTimestamp(value: string): Date | null {
  const match = DISPLAY_TIMESTAMP_RE.exec(value);
  if (!match) return null;
  const [, dd, mm, yyyy, hh, min] = match;
  const utcMs =
    Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min)) - IST_OFFSET_MS;
  return new Date(utcMs);
}

export function displayTimeOnly(value: string): string {
  return value.split(" ")[1] ?? value;
}

const SERVICE_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Meta only allows free-form replies within 24h of the patient's last inbound
 * message — drives the composer's disabled state (§4.3 "24-hour window").
 */
export function isServiceWindowOpen(
  messages: Pick<ApiMessage, "direction" | "created_at">[]
): boolean {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].direction === "inbound") {
      const ts = parseIstDisplayTimestamp(messages[i].created_at);
      if (!ts) return false;
      return Date.now() - ts.getTime() < SERVICE_WINDOW_MS;
    }
  }
  return false;
}

// ---------- Schema ----------

export const noteSchema = z.object({
  text: z.string().trim().min(1, "Note can't be empty"),
});

export type NoteFormValues = z.infer<typeof noteSchema>;

export const tagsSchema = z.object({
  tags: z.array(z.string().trim().min(1)),
});

export type TagsFormValues = z.infer<typeof tagsSchema>;

const csvRecipientSchema = z.object({
  phone: z.string().trim().min(1),
  variables: z.array(z.string()),
});

export const broadcastSchema = z
  .object({
    template_name: z.string().trim().min(1, "Template is required"),
    language: z.string().trim().min(1, "Language is required"),
    variables: z.array(z.string()),
    /** Uniform across the whole broadcast — see templateHasHeaderVariable/templateHasButtonVariable. */
    header_variable: z.string().optional(),
    button_variable: z.string().optional(),
    target_mode: z.enum(["phones", "all_patients", "inactive_days", "csv"]),
    phones_raw: z.string().optional(),
    inactive_since_days: z.coerce.number().int().min(0).optional(),
    /** Parsed client-side from an uploaded CSV (BroadcastFormCard, via
     * papaparse) — one row per recipient, `variables` already aligned to
     * the template's {{n}} count. */
    csv_recipients: z.array(csvRecipientSchema),
    send_later: z.boolean(),
    /** `datetime-local` input value (no timezone) — converted to epoch ms
     * at submit time, interpreted in the browser's local timezone. */
    scheduled_at_local: z.string().optional(),
  })
  .refine((v) => v.target_mode !== "phones" || Boolean(v.phones_raw?.trim()), {
    message: "Enter at least one phone number",
    path: ["phones_raw"],
  })
  .refine((v) => v.target_mode !== "inactive_days" || v.inactive_since_days !== undefined, {
    message: "Enter a number of days",
    path: ["inactive_since_days"],
  })
  .refine((v) => v.target_mode !== "csv" || v.csv_recipients.length > 0, {
    message: "Upload a CSV with at least one recipient",
    path: ["csv_recipients"],
  })
  .refine((v) => !v.send_later || Boolean(v.scheduled_at_local), {
    message: "Pick a date and time",
    path: ["scheduled_at_local"],
  })
  .refine(
    (v) => {
      if (!v.send_later || !v.scheduled_at_local) return true;
      return new Date(v.scheduled_at_local).getTime() > Date.now();
    },
    { message: "Must be in the future", path: ["scheduled_at_local"] }
  );

export type BroadcastFormValues = z.infer<typeof broadcastSchema>;

export const EMPTY_BROADCAST_VALUES: BroadcastFormValues = {
  template_name: "",
  language: "en_US",
  variables: [],
  header_variable: "",
  button_variable: "",
  target_mode: "phones",
  phones_raw: "",
  inactive_since_days: 180,
  csv_recipients: [],
  send_later: false,
  scheduled_at_local: "",
};

const templateButtonSchema = z.object({
  type: z.enum(["QUICK_REPLY", "URL", "PHONE_NUMBER"]),
  text: z.string().trim().min(1, "Button text is required").max(25, "25 characters max"),
  url: z.string().trim().optional(),
  phone_number: z.string().trim().optional(),
});

/** Mirrors the backend's validation in create_template_request (whatsapp.py)
 * so the admin sees mistakes before submitting — the backend re-checks
 * everything regardless, this is purely a faster feedback loop. */
export const createTemplateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, and underscores only"),
    language: z.string().trim().min(1, "Language is required"),
    category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]),
    header_type: z.enum(["NONE", "TEXT", "IMAGE"]),
    header_text: z.string().optional(),
    header_image: z.custom<File | null>((v) => v === null || v instanceof File).optional(),
    body_text: z.string().optional(),
    body_sample_values: z.array(z.string()),
    footer_text: z.string().optional(),
    buttons: z.array(templateButtonSchema),
    auth_code_expiration_minutes: z.coerce.number().int().min(1, "Minimum 1 minute").max(90, "Maximum 90 minutes"),
    auth_add_security_recommendation: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.category === "AUTHENTICATION") return;

    if (v.header_type === "TEXT" && !v.header_text?.trim()) {
      ctx.addIssue({ code: "custom", path: ["header_text"], message: "Header text is required" });
    }
    if (v.header_type === "IMAGE" && !v.header_image) {
      ctx.addIssue({ code: "custom", path: ["header_image"], message: "Header image is required" });
    }

    const bodyText = v.body_text?.trim() ?? "";
    if (!bodyText) {
      ctx.addIssue({ code: "custom", path: ["body_text"], message: "Body text is required" });
    } else {
      const count = bodyVariableCount(bodyText);
      if (v.body_sample_values.length !== count) {
        ctx.addIssue({
          code: "custom",
          path: ["body_sample_values"],
          message: `Provide ${count} sample value(s) to match the {{n}} placeholders in the body`,
        });
      } else if (v.body_sample_values.some((s) => !s.trim())) {
        ctx.addIssue({ code: "custom", path: ["body_sample_values"], message: "Every sample value must be filled in" });
      }
    }

    if (v.buttons.length > 3) {
      ctx.addIssue({ code: "custom", path: ["buttons"], message: "At most 3 buttons are allowed" });
    }
    const urlButtons = v.buttons.filter((b) => b.type === "URL");
    if (urlButtons.length > 1) {
      ctx.addIssue({ code: "custom", path: ["buttons"], message: "Only one URL button is allowed" });
    }
    if (urlButtons.some((b) => !b.url?.trim())) {
      ctx.addIssue({ code: "custom", path: ["buttons"], message: "URL buttons need a URL" });
    }
    const phoneButtons = v.buttons.filter((b) => b.type === "PHONE_NUMBER");
    if (phoneButtons.length > 1) {
      ctx.addIssue({ code: "custom", path: ["buttons"], message: "Only one phone number button is allowed" });
    }
    if (phoneButtons.some((b) => !b.phone_number?.trim())) {
      ctx.addIssue({ code: "custom", path: ["buttons"], message: "Phone number buttons need a phone number" });
    }
  });

export type CreateTemplateFormValues = z.infer<typeof createTemplateSchema>;

export const EMPTY_CREATE_TEMPLATE_VALUES: CreateTemplateFormValues = {
  name: "",
  language: "en_US",
  category: "UTILITY",
  header_type: "NONE",
  header_text: "",
  header_image: null,
  body_text: "",
  body_sample_values: [],
  footer_text: "",
  buttons: [],
  auth_code_expiration_minutes: 5,
  auth_add_security_recommendation: true,
};

// ---------- Service ----------

function mapAuditLog(raw: RawApiAuditLog): ApiAuditLog {
  return {
    id: raw._id,
    conversation_id: raw.conversation_id,
    action: raw.action,
    actor_user_id: raw.actor_user_id,
    actor_name: raw.actor_name,
    details: raw.details,
    created_at: raw.created_at,
  };
}

function mapTemplate(raw: RawApiTemplate): ApiTemplate {
  return {
    id: raw._id,
    name: raw.name,
    language: raw.language,
    meta_template_id: raw.meta_template_id,
    category: raw.category,
    status: raw.status,
    components: raw.components,
    synced_at: raw.synced_at,
  };
}

function mapTemplateRequest(raw: RawApiTemplateRequest): ApiTemplateRequest {
  return {
    id: raw._id,
    name: raw.name,
    language: raw.language,
    category: raw.category,
    header: raw.header,
    body_text: raw.body_text,
    body_sample_values: raw.body_sample_values,
    footer_text: raw.footer_text,
    buttons: raw.buttons,
    auth_config: raw.auth_config,
    meta_template_id: raw.meta_template_id,
    status: raw.status,
    rejected_reason: raw.rejected_reason,
    submit_error: raw.submit_error,
    created_by: raw.created_by,
    created_at: raw.created_at,
  };
}

function mapBroadcastJob(raw: RawApiBroadcastJob): ApiBroadcastJob {
  return {
    id: raw._id,
    template_name: raw.template_name,
    language: raw.language,
    variables: raw.variables,
    total: raw.total,
    sent_count: raw.sent_count,
    failed_count: raw.failed_count,
    failures: raw.failures,
    status: raw.status,
    created_by: raw.created_by,
    started_at: raw.started_at,
    completed_at: raw.completed_at,
    scheduled_at: raw.scheduled_at,
    created_at: raw.created_at,
  };
}

export interface WhatsAppConfigItem {
  key: string;
  configured: boolean;
  purpose: string;
}

export interface WhatsAppActivitySummary {
  templates_approved: number;
  templates_rejected: number;
  broadcasts_completed: number;
}

export const whatsappService = {
  listConversations: (params: ConversationListParams = {}) =>
    http.get<{ count: number; conversations: ApiConversation[] }>(API_ENDPOINTS.whatsapp.conversations, {
      params,
    }),

  getMessages: (phone: string, params: { before?: number; limit?: number } = {}) =>
    http.get<{ conversation_id: string; messages: ApiMessage[]; next_before_cursor: number | null; has_more: boolean }>(
      API_ENDPOINTS.whatsapp.messages(phone),
      { params }
    ),

  sendMessage: (phone: string, input: { text?: string; caption?: string; file?: File }) => {
    const form = new FormData();
    if (input.text) form.append("text", input.text);
    if (input.caption) form.append("caption", input.caption);
    if (input.file) form.append("file", input.file);
    return http.post<{ conversation_id: string }>(API_ENDPOINTS.whatsapp.send(phone), form);
  },

  markRead: (phone: string) =>
    http.post<{ conversation_id: string; updated_count: number }>(API_ENDPOINTS.whatsapp.read(phone)),

  takeover: (phone: string) =>
    http.post<{ conversation_id: string; human_mode: boolean }>(API_ENDPOINTS.whatsapp.takeover(phone)),

  release: (phone: string) =>
    http.post<{ conversation_id: string; human_mode: boolean }>(API_ENDPOINTS.whatsapp.release(phone)),

  addNote: (phone: string, text: string) =>
    http.post<{ conversation_id: string; message_id: string }>(API_ENDPOINTS.whatsapp.note(phone), { text }),

  setTags: (phone: string, tags: string[]) =>
    http.put<{ conversation_id: string; tags: string[] }>(API_ENDPOINTS.whatsapp.tags(phone), { tags }),

  retryMessage: (phone: string, messageId: string) =>
    http.post<{ conversation_id: string; original_message_id: string }>(
      API_ENDPOINTS.whatsapp.retry(phone, messageId)
    ),

  searchMessages: (phone: string, q: string, limit?: number) =>
    http.get<{ conversation_id: string; query: string; count: number; messages: ApiMessage[] }>(
      API_ENDPOINTS.whatsapp.search(phone),
      { params: { q, limit } }
    ),

  getAuditLog: async (phone: string) => {
    const res = await http.get<{ conversation_id: string; logs: RawApiAuditLog[] }>(
      API_ENDPOINTS.whatsapp.auditLog(phone)
    );
    return { ...res, data: { ...res.data, logs: res.data.logs.map(mapAuditLog) } };
  },

  /** Downloads the plain-text transcript as a Blob — caller triggers the save. */
  exportConversation: async (phone: string) => {
    const res = await apiClient.get<Blob>(API_ENDPOINTS.whatsapp.export(phone), {
      responseType: "blob",
    });
    return res.data;
  },

  listTemplates: async (status?: string) => {
    const res = await http.get<{ count: number; templates: RawApiTemplate[] }>(
      API_ENDPOINTS.whatsapp.templates,
      { params: status ? { status } : undefined }
    );
    return { ...res, data: { ...res.data, templates: res.data.templates.map(mapTemplate) } };
  },

  syncTemplates: () => http.post<{ synced: number }>(API_ENDPOINTS.whatsapp.templatesSync),

  createBroadcast: (payload: CreateBroadcastPayload) =>
    http.post<{ job_id: string; total: number }>(API_ENDPOINTS.whatsapp.broadcast, payload),

  /** Dry run — same targeting fields as createBroadcast, no job created. */
  previewBroadcastRecipients: (
    payload: Pick<CreateBroadcastPayload, "phones" | "filter" | "recipients">
  ) => http.post<{ count: number; sample: string[] }>(API_ENDPOINTS.whatsapp.broadcastPreview, payload),

  listBroadcastJobs: async () => {
    const res = await http.get<{ count: number; jobs: RawApiBroadcastJob[] }>(API_ENDPOINTS.whatsapp.broadcast);
    return { ...res, data: { ...res.data, jobs: res.data.jobs.map(mapBroadcastJob) } };
  },

  getBroadcastJob: async (jobId: string) => {
    const res = await http.get<{ job: RawApiBroadcastJob }>(API_ENDPOINTS.whatsapp.broadcastJob(jobId));
    return { ...res, data: { job: mapBroadcastJob(res.data.job) } };
  },

  /** multipart/form-data — mirrors sendMessage's FormData pattern above.
   * AUTHENTICATION requests omit header/body/footer/buttons entirely since
   * the backend ignores/rejects them for that category (whatsapp.py). */
  createTemplateRequest: (values: CreateTemplateFormValues) => {
    const form = new FormData();
    form.append("name", values.name.trim().toLowerCase());
    form.append("language", values.language.trim());
    form.append("category", values.category);

    if (values.category === "AUTHENTICATION") {
      form.append("auth_code_expiration_minutes", String(values.auth_code_expiration_minutes));
      form.append("auth_add_security_recommendation", String(values.auth_add_security_recommendation));
    } else {
      form.append("header_type", values.header_type);
      if (values.header_type === "TEXT") form.append("header_text", values.header_text ?? "");
      if (values.header_type === "IMAGE" && values.header_image) form.append("header_image", values.header_image);
      form.append("body_text", values.body_text ?? "");
      form.append("body_sample_values_json", JSON.stringify(values.body_sample_values));
      if (values.footer_text?.trim()) form.append("footer_text", values.footer_text.trim());
      form.append("buttons_json", JSON.stringify(values.buttons));
    }

    return http.post<{ request_id: string; status: TemplateRequestStatus }>(
      API_ENDPOINTS.whatsapp.templateRequests,
      form
    );
  },

  listTemplateRequests: async () => {
    const res = await http.get<{ count: number; requests: RawApiTemplateRequest[] }>(
      API_ENDPOINTS.whatsapp.templateRequests
    );
    return { ...res, data: { ...res.data, requests: res.data.requests.map(mapTemplateRequest) } };
  },

  getTemplateRequest: async (requestId: string) => {
    const res = await http.get<{ request: RawApiTemplateRequest }>(API_ENDPOINTS.whatsapp.templateRequest(requestId));
    return { ...res, data: { request: mapTemplateRequest(res.data.request) } };
  },

  retryTemplateRequest: (requestId: string) =>
    http.post<{ request_id: string; status: TemplateRequestStatus }>(
      API_ENDPOINTS.whatsapp.templateRequestRetry(requestId)
    ),

  getConfigStatus: () => http.get<{ config: WhatsAppConfigItem[] }>(API_ENDPOINTS.whatsapp.configStatus),

  getActivitySummary: (since: number) =>
    http.get<WhatsAppActivitySummary>(API_ENDPOINTS.whatsapp.activitySummary, { params: { since } }),

  getGlobalAuditLog: async () => {
    const res = await http.get<{ logs: RawApiAuditLog[] }>(API_ENDPOINTS.whatsapp.globalAuditLog);
    return { ...res, data: { logs: res.data.logs.map(mapAuditLog) } };
  },
};
