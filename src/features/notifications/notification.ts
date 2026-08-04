// ---------- Types ----------

export type NotificationType =
  | "appointment_new"
  | "appointment_confirmed"
  | "appointment_cancelled"
  | "followup_reminder"
  | "message_failed"
  | "enquiry_new"
  | "doctor_linked"
  | "doctor_unlinked";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string; // ISO string
  isRead: boolean;
}

// ---------- Dummy data ----------

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** Builds fresh relative timestamps on every call so the demo always reads as "live". */
export function buildDummyNotifications(): AppNotification[] {
  const now = Date.now();
  const ago = (ms: number) => new Date(now - ms).toISOString();

  return [
    {
      id: "n1",
      type: "appointment_new",
      title: "New appointment booked",
      description:
        "Rahul Sharma booked an appointment with Dr. Ekhlaq Ahmad for 05 Aug, 11:00 AM.",
      timestamp: ago(2 * MIN),
      isRead: false,
    },
    {
      id: "n2",
      type: "message_failed",
      title: "WhatsApp message failed",
      description:
        "Appointment reminder to Priya Verma (+91 98765 43210) could not be delivered.",
      timestamp: ago(12 * MIN),
      isRead: false,
    },
    {
      id: "n3",
      type: "appointment_confirmed",
      title: "Appointment confirmed",
      description:
        "Dr. Sneha Kapoor confirmed the appointment with Amit Yadav for 06 Aug, 4:30 PM.",
      timestamp: ago(45 * MIN),
      isRead: false,
    },
    {
      id: "n4",
      type: "enquiry_new",
      title: "New enquiry received",
      description:
        "Anjali Mehta enquired about Root Canal Treatment via the website contact form.",
      timestamp: ago(1 * HOUR),
      isRead: false,
    },
    {
      id: "n5",
      type: "followup_reminder",
      title: "Follow-up reminder due",
      description:
        "Follow-up due today for Suresh Kumar (Diabetes checkup, last visit 20 Jul).",
      timestamp: ago(3 * HOUR),
      isRead: false,
    },
    {
      id: "n6",
      type: "appointment_cancelled",
      title: "Appointment cancelled",
      description:
        "Neha Joshi cancelled her appointment with Dr. Ekhlaq Ahmad scheduled for 03 Aug, 9:00 AM.",
      timestamp: ago(1 * DAY + 5 * HOUR),
      isRead: true,
    },
    {
      id: "n7",
      type: "doctor_linked",
      title: "Doctor linked to branch",
      description:
        "Dr. Vikram Singh was linked to Abdhind Medicare — Sector 62 branch.",
      timestamp: ago(1 * DAY + 10 * HOUR),
      isRead: true,
    },
    {
      id: "n8",
      type: "message_failed",
      title: "WhatsApp message failed",
      description:
        'Broadcast to 24 patients failed — Meta template "appointment_reminder" was rejected.',
      timestamp: ago(2 * DAY),
      isRead: true,
    },
    {
      id: "n9",
      type: "doctor_unlinked",
      title: "Doctor unlinked from branch",
      description:
        "Dr. Farhan Ali was unlinked from Abdhind Medicare — Noida branch.",
      timestamp: ago(3 * DAY),
      isRead: true,
    },
    {
      id: "n10",
      type: "appointment_new",
      title: "New appointment booked",
      description:
        "Kavita Desai booked an appointment with Dr. Sneha Kapoor for 08 Aug, 10:30 AM.",
      timestamp: ago(5 * DAY),
      isRead: true,
    },
  ];
}

// ---------- Formatting ----------

export function formatTimeAgo(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();

  if (diffMs < MIN) return "Just now";
  if (diffMs < HOUR) {
    const m = Math.floor(diffMs / MIN);
    return `${m} min ago`;
  }
  if (diffMs < DAY) {
    const h = Math.floor(diffMs / HOUR);
    return `${h} hour${h > 1 ? "s" : ""} ago`;
  }

  const time = date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const startOfDate = new Date(date).setHours(0, 0, 0, 0);
  const dayDiff = Math.round((startOfToday - startOfDate) / DAY);

  if (dayDiff === 1) return `Yesterday, ${time}`;
  if (dayDiff < 7) return `${dayDiff} days ago`;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}
