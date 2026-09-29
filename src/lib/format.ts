/** Shared display formatters for values the API returns raw. */

const DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

/** Epoch-ms (what the backend's unique_timestamp() stores) -> "29 Sep 2026, 09:15 pm".
 * Falls back to "—" for a missing or unparseable value instead of "Invalid Date". */
export function formatEpochMs(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", DATE_TIME_FORMAT);
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
