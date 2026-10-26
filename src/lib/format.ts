/** Shared display formatters for values the API returns raw. */

import { formatEpochDateTime12 } from "@/src/lib/time";

/** Epoch-ms (what the backend's unique_timestamp() stores) -> "29 Sep 2026, 09:15 PM" (IST).
 * Falls back to "—" for a missing or unparseable value instead of "Invalid Date". */
export function formatEpochMs(value: number | null | undefined): string {
  return formatEpochDateTime12(value);
}

/** The WhatsApp bot's language codes (TRANSLATIONS keys in routes/whatsapp.py). */
const LANGUAGE_LABELS: Record<string, string> = {
  hi: "Hindi",
  en: "English",
};

/** "hi" -> "Hindi"; unknown codes are shown as-is, a missing one as "—". */
export function languageLabel(code: string | null | undefined): string {
  if (!code) return "—";
  return LANGUAGE_LABELS[code] ?? code;
}
