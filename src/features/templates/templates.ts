import { http } from "@/src/services/http";
import { API_ENDPOINTS } from "@/src/config/endpoints";

// ---------- Types ----------
// Built by GET /whatsapp/templates/overview and /{key}/detail
// (abdhind-medicare-be routes/whatsapp.py, "Templates page" section).

export type TemplateStatus =
  | "APPROVED"
  | "PENDING"
  | "IN_APPEAL"
  | "SUBMITTING"
  | "REJECTED"
  | "SUBMIT_FAILED"
  | "NOT_SUBMITTED"
  | "PAUSED"
  | "DISABLED"
  | string;

export type VersionState = "approved" | "rejected" | "in_review" | "not_submitted" | "paused";
export type RowState = "up_to_date" | "ready" | "rejected" | "in_review" | "not_submitted" | "approved" | "paused";
export type RowAction = "switch" | "fix" | "submit" | "view";

export interface VersionSummary {
  name: string;
  label: string;
  live: boolean;
  languages: string[];
  statuses: Record<string, TemplateStatus>;
  state: VersionState;
  reason: string | null;
  category: string | null;
  sent_30d: number;
}

export interface TemplateRow {
  /** Message type ("appointment_approved"), "otp", or a custom template name. */
  key: string;
  kind: "system" | "otp" | "custom";
  name: string;
  template: string;
  category: string | null;
  languages: string[];
  live: { name: string; label: string; state: VersionState } | null;
  latest: VersionSummary;
  state: RowState;
  action: RowAction;
  sent_30d: number;
}

export interface HiddenTemplate extends VersionSummary {
  row_key: string;
  row_name: string;
  reason_hidden: "test" | "old" | "retired" | "hidden";
}

export interface TemplatesOverview {
  cards: { ready: number; in_review: number; rejected: number; sent_30d: number };
  rows: TemplateRow[];
  hidden: HiddenTemplate[];
  updated_at: number;
}

export interface TemplateContent {
  header: string | null;
  body: string | null;
  footer: string | null;
  buttons: { type: string; text: string; url?: string | null }[];
}

export interface HistoryEvent {
  status: string;
  /** Epoch ms, or null when only the current status is known ("date unknown"). */
  at: number | null;
  reason?: string | null;
  by?: string | null;
}

export interface LanguageDetail {
  status: TemplateStatus;
  reason: string | null;
  content: TemplateContent;
  sample_values: string[];
  history: HistoryEvent[];
}

export interface TemplateVariable {
  n: number;
  key: string | null;
  label: string;
}

export interface VersionDetail extends VersionSummary {
  variables: TemplateVariable[];
  languages_detail: Record<string, LanguageDetail>;
}

export interface TemplateDetail {
  key: string;
  info: { name: string; description: string; kind: TemplateRow["kind"]; message_type: string | null };
  live_name: string | null;
  versions: VersionDetail[];
  /** Name for "Fix & resubmit" / "Duplicate as new", e.g. appointment_approved_v3. */
  next_version_name: string | null;
  allowed_variables: { key: string; label: string }[];
  sample_values: Record<string, string>;
  clinic_name: string;
}

// ---------- Labels ----------

export const LANGUAGE_LABEL: Record<string, string> = { hi: "Hinglish", en_US: "English", en: "English" };
export const LANGUAGE_CHIP: Record<string, string> = { hi: "HI", en_US: "EN", en: "EN" };
/** The two languages every system message is sent in. */
export const MAIN_LANGUAGES = ["hi", "en_US"] as const;

export const CATEGORY_LABEL: Record<string, string> = {
  UTILITY: "Utility",
  MARKETING: "Marketing",
  AUTHENTICATION: "Login code",
};

export function statusLabel(status: TemplateStatus): string {
  switch (status) {
    case "APPROVED":
      return "Approved";
    case "PENDING":
    case "IN_APPEAL":
    case "SUBMITTING":
      return "In review";
    case "REJECTED":
      return "Rejected";
    case "SUBMIT_FAILED":
      return "Submit failed";
    case "NOT_SUBMITTED":
      return "Not submitted";
    default:
      return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");
  }
}

export function historyLabel(status: string): string {
  return status === "SUBMITTED" ? "Submitted to Meta" : statusLabel(status);
}

/** Meta's rejection codes in plain words (anything else is shown as-is). */
export function reasonLabel(reason: string | null | undefined): string | null {
  if (!reason) return null;
  const map: Record<string, string> = {
    INCORRECT_CATEGORY: "Meta thinks the category is wrong (e.g. looks like marketing)",
    INVALID_FORMAT: "Formatting Meta doesn't accept",
    ABUSIVE_CONTENT: "Content Meta considers abusive",
    PROMOTIONAL: "Reads as promotional",
    TAG_CONTENT_MISMATCH: "Text doesn't match the chosen category",
    SCAM: "Flagged as possibly misleading",
  };
  return map[reason] ?? reason.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function versionNumber(label: string): number {
  return Number(label.replace(/\D/g, "")) || 1;
}

// ---------- Preview / diff helpers ----------

/** Body split into text and filled-variable parts, so the preview can
 * highlight the sample values. */
export function fillSegments(text: string | null, values: string[]): { text: string; variable?: number }[] {
  if (!text) return [];
  const out: { text: string; variable?: number }[] = [];
  const re = /\{\{(\d+)\}\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    const n = Number(m[1]);
    out.push({ text: values[n - 1] || m[0], variable: n });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

/** A body as the patient reads it, for diffing two versions: variables become
 * their sample values (same on both sides, so they don't show as changes),
 * except the greeting, which reads "Good Morning / Afternoon / Evening". */
export function readableBody(text: string, variables: TemplateVariable[], samples: string[]): string {
  return text.replace(/\{\{(\d+)\}\}/g, (m, n) => {
    const v = variables.find((x) => x.n === Number(n));
    if (v?.key === "greeting") return "Good Morning / Afternoon / Evening";
    return samples[Number(n) - 1] || m;
  });
}

/** Word-level diff (LCS) between two bodies — "What changed from vN". */
export function wordDiff(before: string, after: string): { text: string; type: "same" | "added" | "removed" }[] {
  const a = before.split(/(\s+)/).filter(Boolean);
  const b = after.split(/(\s+)/).filter(Boolean);
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: { text: string; type: "same" | "added" | "removed" }[] = [];
  const push = (text: string, type: "same" | "added" | "removed") => {
    const prev = out[out.length - 1];
    if (prev && prev.type === type) prev.text += text;
    else out.push({ text, type });
  };
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      push(a[i], "same");
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) push(a[i++], "removed");
    else push(b[j++], "added");
  }
  while (i < a.length) push(a[i++], "removed");
  while (j < b.length) push(b[j++], "added");
  return out;
}

/** Only the changed words, merged into short "removed -> added" pairs. */
export function changeSummary(before: string, after: string): { removed: string; added: string }[] {
  const parts = wordDiff(before, after);
  const changes: { removed: string; added: string }[] = [];
  let cur: { removed: string; added: string } | null = null;
  for (const p of parts) {
    if (p.type === "same") {
      if (p.text.trim() && cur) {
        changes.push(cur);
        cur = null;
      } else if (!p.text.trim() && cur) {
        // keep the space inside a multi-word change ("Thank You")
        cur.removed += p.text;
        cur.added += p.text;
      }
      continue;
    }
    cur = cur ?? { removed: "", added: "" };
    cur[p.type] += p.text;
  }
  if (cur) changes.push(cur);
  return changes
    .map((c) => ({ removed: c.removed.trim(), added: c.added.trim() }))
    .filter((c) => c.removed || c.added);
}

// ---------- Validation (mirrors the backend; runs before submitting) ----------

export const LIMITS = { body: 1024, header: 60, footer: 60, button: 25, name: 512 } as const;
const MARKETING_WORDS = /\b(offer|discount|sale|% off|free|deal|limited time|buy|shop now|cashback|coupon|promo)\b/i;

export interface DraftLanguage {
  header: string;
  body: string;
  footer: string;
  samples: string[];
}

export interface TemplateDraft {
  friendlyName: string;
  name: string;
  messageType: string;
  category: "UTILITY" | "MARKETING";
  languages: string[];
  perLanguage: Record<string, DraftLanguage>;
  buttons: { type: "QUICK_REPLY" | "URL"; text: string; url: string }[];
  /** Message type versions: what each {{n}} means (keys). */
  variableKeys: string[];
}

export function variableNumbers(body: string): number[] {
  return [...new Set([...body.matchAll(/\{\{(\d+)\}\}/g)].map((m) => Number(m[1])))].sort((x, y) => x - y);
}

/** Problems that block submitting, plus warnings that don't. */
export function validateDraft(d: TemplateDraft): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!d.friendlyName.trim()) errors.push("Give the template a friendly name.");
  if (!/^[a-z0-9_]+$/.test(d.name)) errors.push("Template name: lowercase letters, numbers and _ only.");
  if (!d.languages.length) errors.push("Pick at least one language.");
  for (const lang of d.languages) {
    const l = d.perLanguage[lang];
    const tag = `${LANGUAGE_LABEL[lang] ?? lang}:`;
    const body = l.body.trim();
    if (!body) {
      errors.push(`${tag} the message is empty.`);
      continue;
    }
    const nums = variableNumbers(body);
    if (nums.some((n, i) => n !== i + 1)) errors.push(`${tag} number the variables in order — {{1}}, {{2}}, …`);
    if (body.startsWith("{{") || body.endsWith("}}")) errors.push(`${tag} the message can't start or end with a variable.`);
    if (/\}\}\s*\{\{/.test(body)) errors.push(`${tag} two variables can't be side by side.`);
    if (body.length > LIMITS.body) errors.push(`${tag} the message is ${body.length}/${LIMITS.body} characters.`);
    if (l.header.length > LIMITS.header) errors.push(`${tag} the header is over ${LIMITS.header} characters.`);
    if (l.footer.length > LIMITS.footer) errors.push(`${tag} the footer is over ${LIMITS.footer} characters.`);
    if (nums.some((n) => !(l.samples[n - 1] ?? "").trim())) errors.push(`${tag} add a sample value for every variable.`);
    if (d.messageType && nums.length !== d.variableKeys.filter(Boolean).length)
      errors.push(`${tag} choose what each variable means.`);
    if (d.category === "UTILITY" && MARKETING_WORDS.test(`${l.header} ${body} ${l.footer}`))
      warnings.push(`${tag} words like "offer" or "discount" look like marketing — Meta may reject it as Utility.`);
  }
  if (d.languages.length === 2) {
    const [a, b] = d.languages.map((l) => variableNumbers(d.perLanguage[l].body).length);
    if (a !== b) errors.push("Both languages need the same number of variables.");
  }
  for (const btn of d.buttons) {
    if (!btn.text.trim()) errors.push("Every button needs text.");
    if (btn.text.length > LIMITS.button) errors.push(`Button "${btn.text}" is over ${LIMITS.button} characters.`);
    if (/[*_~`{}\n]/.test(btn.text)) errors.push(`Button "${btn.text}" can't contain formatting or variables.`);
    if (btn.type === "URL" && !/^https?:\/\//.test(btn.url)) errors.push(`Button "${btn.text}" needs a full URL (https://…).`);
  }
  if (d.buttons.length > 3) errors.push("At most 3 buttons.");
  if (d.buttons.filter((b) => b.type === "URL").length > 1) errors.push("Only one link button.");
  return { errors, warnings };
}

export function toTemplateName(friendly: string): string {
  return friendly
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

// ---------- Service ----------

export const TEMPLATES_OVERVIEW_KEY = ["whatsapp", "templates-page", "overview"] as const;
export const templateDetailKey = (key: string) => ["whatsapp", "templates-page", "detail", key] as const;
/** Everything the Templates page caches — the activity watcher invalidates it. */
export const TEMPLATES_PAGE_KEY = ["whatsapp", "templates-page"] as const;

export const templatesService = {
  overview: () => http.get<TemplatesOverview>(API_ENDPOINTS.whatsapp.templatesOverview),

  detail: (key: string) => http.get<TemplateDetail>(API_ENDPOINTS.whatsapp.templateDetail(key)),

  /** PUT name-map — the backend refuses unless every language is approved. */
  switchVersion: (messageType: string, templateName: string) =>
    http.put<{ effective: Record<string, string> }>(API_ENDPOINTS.whatsapp.templateNameMap, {
      names: { [messageType]: templateName },
    }),

  setHidden: (name: string, hidden: boolean) =>
    http.put<null>(API_ENDPOINTS.whatsapp.templatesHidden, { name, hidden }),

  sync: () => http.post<{ synced: number }>(API_ENDPOINTS.whatsapp.templatesSync),

  /** Submit not-yet-submitted system versions (the row's "Submit" action). */
  submitSystem: (names: string[]) =>
    http.post<{ results: { name: string; language: string; status: string; reason?: string }[] }>(
      API_ENDPOINTS.whatsapp.seedSystemTemplates,
      { names }
    ),

  /** One language of a new template, through the existing request API. */
  submitLanguage: (d: TemplateDraft, lang: string) => {
    const l = d.perLanguage[lang];
    const nums = variableNumbers(l.body);
    const form = new FormData();
    form.append("name", d.name);
    form.append("language", lang);
    form.append("category", d.category);
    form.append("friendly_name", d.friendlyName.trim());
    if (l.header.trim()) {
      form.append("header_type", "TEXT");
      form.append("header_text", l.header.trim());
    }
    form.append("body_text", l.body.trim());
    form.append("body_sample_values_json", JSON.stringify(nums.map((n) => l.samples[n - 1]?.trim() ?? "")));
    if (l.footer.trim()) form.append("footer_text", l.footer.trim());
    form.append(
      "buttons_json",
      JSON.stringify(d.buttons.map((b) => (b.type === "URL" ? { type: "URL", text: b.text, url: b.url } : { type: "QUICK_REPLY", text: b.text })))
    );
    if (d.messageType) {
      form.append("message_type", d.messageType);
      form.append("variable_keys_json", JSON.stringify(d.variableKeys.slice(0, nums.length)));
    }
    return http.post<{ request_id: string; status: string }>(API_ENDPOINTS.whatsapp.templateRequests, form);
  },
};
