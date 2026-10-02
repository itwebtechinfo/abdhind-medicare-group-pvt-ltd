import { http } from "@/src/services/http";
import { API_ENDPOINTS } from "@/src/config/endpoints";
import {
  dayMonth,
  formatClock,
  istNow,
  sourceLabel,
  splitAppointmentDateTime,
} from "@/src/features/appointments/appointment";

// ---------- Types ----------

/** Derived live by GET /notifications from records that need action. */
export type NotificationType = "enquiry_new" | "appointment_pending";

interface BaseNotification {
  /** "enquiry:<id>" / "appointment:<id>" — what mark-as-read stores. */
  key: string;
  /** Epoch ms. */
  created_at: number;
  is_read: boolean;
  name: string | null;
}

export interface EnquiryNotification extends BaseNotification {
  type: "enquiry_new";
  enquiry_id: string;
  phone: string | null;
  preferred_time: string | null;
}

export interface AppointmentNotification extends BaseNotification {
  type: "appointment_pending";
  appointment_id: string;
  patient_id: string;
  doctor_name: string | null;
  appointment_datetime: string | null;
  source: string | null;
}

export type AppNotification = EnquiryNotification | AppointmentNotification;

// ---------- Service ----------

export const notificationService = {
  list: () => http.get<{ items: AppNotification[]; unread_count: number }>(API_ENDPOINTS.notifications.list),
  markRead: (keys: string[]) => http.post<null>(API_ENDPOINTS.notifications.read, { keys }),
  markAllRead: () => http.post<null>(API_ENDPOINTS.notifications.readAll),
};

// ---------- Display ----------

/** Title, one-line description and the drawer link for an item. */
export function describeNotification(n: AppNotification): { title: string; description: string; href: string } {
  if (n.type === "enquiry_new") {
    return {
      title: "New enquiry",
      description: `${n.name ?? "Someone"} requested a callback${n.preferred_time ? ` · ${n.preferred_time}` : ""}`,
      href: `/enquiries?enquiry=${encodeURIComponent(n.enquiry_id)}`,
    };
  }
  let when = "";
  if (n.appointment_datetime) {
    const { date, minutes } = splitAppointmentDateTime(n.appointment_datetime);
    const clock = formatClock(minutes);
    when = ` for ${dayMonth(date, istNow(Date.now()).date)}, ${clock.time} ${clock.period}`;
  }
  return {
    title: "Appointment needs approval",
    description: `${n.name ?? "A patient"} booked${n.doctor_name ? ` with ${n.doctor_name}` : ""}${when}${
      n.source ? ` · via ${sourceLabel(n.source)}` : ""
    }`,
    href: `/appointments?appointment=${encodeURIComponent(n.appointment_id)}&patient=${encodeURIComponent(n.patient_id)}`,
  };
}

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export function formatTimeAgo(epochMs: number): string {
  const diffMs = Date.now() - epochMs;
  if (diffMs < MIN) return "Just now";
  if (diffMs < HOUR) return `${Math.floor(diffMs / MIN)} min ago`;
  if (diffMs < DAY) {
    const h = Math.floor(diffMs / HOUR);
    return `${h} hour${h > 1 ? "s" : ""} ago`;
  }
  const days = Math.floor(diffMs / DAY);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(epochMs).toLocaleDateString("en-IN", { day: "2-digit", month: "short", timeZone: "Asia/Kolkata" });
}
