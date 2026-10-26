/**
 * The ONE place that turns a time into what people read: 12-hour "hh:mm AM/PM"
 * ("14:30" -> "02:30 PM", "00:00" -> "12:00 AM", "12:00" -> "12:00 PM").
 * Display only - the API, the database and every <input> keep 24-hour
 * "HH:MM" / naive-IST "YYYY-MM-DDTHH:MM" / epoch ms exactly as before.
 * Clinic times are IST whatever timezone the browser is in.
 */

const IST = "Asia/Kolkata";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const IST_PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: IST,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Minutes since midnight -> { time: "02:30", period: "PM" }. Wraps past 24h. */
export function clock12(minutes: number): { time: string; period: "AM" | "PM" } {
  const total = ((Math.floor(minutes) % 1440) + 1440) % 1440;
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return { time: `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")}`, period: h24 < 12 ? "AM" : "PM" };
}

/** Minutes since midnight -> "02:30 PM". */
export function formatMinutes12(minutes: number): string {
  const { time, period } = clock12(minutes);
  return `${time} ${period}`;
}

/** "14:30" (or "14:30:00") -> "02:30 PM". Anything unparseable is returned as-is. */
export function formatTime12(hhmm: string | null | undefined): string {
  if (!hhmm) return "—";
  const match = /^(\d{1,2}):(\d{2})/.exec(hhmm.trim());
  if (!match) return hhmm;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return hhmm;
  return formatMinutes12(h * 60 + m);
}

/** Naive IST "YYYY-MM-DDTHH:MM" -> "YYYY-MM-DD 02:30 PM" (the date part as before). */
export function formatNaiveDateTime12(value: string | null | undefined): string {
  if (!value) return "—";
  const [date, time] = value.split("T");
  return time ? `${date} ${formatTime12(time)}` : date;
}

function istParts(ms: number): { year: string; month: number; day: number; minutes: number } | null {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return null;
  const p = Object.fromEntries(IST_PARTS.formatToParts(d).map((x) => [x.type, x.value]));
  return { year: p.year, month: Number(p.month), day: Number(p.day), minutes: Number(p.hour) * 60 + Number(p.minute) };
}

/** Epoch ms -> "02:30 PM" (IST). */
export function formatEpochTime12(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return "—";
  const p = istParts(ms);
  return p ? formatMinutes12(p.minutes) : "—";
}

/** Epoch ms -> "29 Sep 2026, 09:15 PM" (IST). */
export function formatEpochDateTime12(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return "—";
  const p = istParts(ms);
  if (!p) return "—";
  return `${p.day} ${MONTHS[p.month - 1]} ${p.year}, ${formatMinutes12(p.minutes)}`;
}

/** The API's display string "DD-MM-YYYY HH:MM" (IST) -> "28 Sep 2026, 11:42 AM".
 * Anything else (already formatted, empty, a plain date) is returned as-is. */
export function formatDisplayDateTime12(value: string | null | undefined): string {
  const match = value?.match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/);
  if (!match) return value || "—";
  const [, d, mo, y, h, mi] = match;
  return `${Number(d)} ${MONTHS[Number(mo) - 1]} ${y}, ${formatMinutes12(Number(h) * 60 + Number(mi))}`;
}
