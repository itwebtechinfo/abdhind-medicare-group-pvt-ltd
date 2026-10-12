import { http } from "@/src/services/http";
import { API_ENDPOINTS } from "@/src/config/endpoints";

// Free routine check-up requests - built by routes/checkups.py. A patient taps
// "Routine Check-up" on the 3-month check-up reminder; staff book the visit here.

export type CheckupStatus = "open" | "scheduled" | "closed";
export type CheckupTab = CheckupStatus | "all";

export interface CheckupAppointment {
  id: string;
  appointment_datetime: string;
  reference_code: string | null;
  status: string;
  doctor_id: string | null;
  doctor_name: string | null;
}

export interface CheckupActor {
  user_id: string | null;
  name: string | null;
}

export interface CheckupRequest {
  id: string;
  phone: string;
  status: CheckupStatus;
  /** "template" (reminder template / broadcast) or "button" (in-chat buttons). */
  via: string | null;
  patient_name: string | null;
  /** null = the number has no patient record yet (one is created when booked). */
  patient: { id: string; full_name: string | null; uhid: string | null; age: number | null; gender: string | null } | null;
  /** Epoch ms. */
  requested_at: number;
  last_requested_at: number;
  request_count: number;
  last_visit: CheckupAppointment | null;
  /** Another live appointment the patient already has (booked some other way). */
  upcoming: CheckupAppointment | null;
  /** The check-up booked from this request. */
  appointment: CheckupAppointment | null;
  scheduled_at: number | null;
  scheduled_by: CheckupActor | null;
  /** sent | failed | opted_out | blocked | template_not_approved */
  notify_status: string | null;
  notified_at: number | null;
  closed_at: number | null;
  closed_by: CheckupActor | null;
  close_reason: string | null;
}

export interface CheckupListResponse {
  requests: CheckupRequest[];
  total: number;
  counts: Record<CheckupStatus, number>;
}

export const CHECKUPS_KEY = ["checkup-requests"] as const;

const LIVE_STATUSES = ["PENDING", "APPROVED", "PATIENT_CONFIRMED"];

/** The booked check-up is still on (not cancelled / done). */
export function isLiveAppointment(a: CheckupAppointment | null): boolean {
  return Boolean(a && LIVE_STATUSES.includes(a.status));
}

/** Why "Send update" didn't reach the patient, in staff words. */
export function notifyStatusNote(status: string | null): string | null {
  switch (status) {
    case null:
    case "sent":
      return null;
    case "opted_out":
      return "Not sent — the patient opted out of WhatsApp messages (STOP).";
    case "blocked":
      return "Not sent — this number is blocked in the inbox.";
    case "template_not_approved":
      return "Not sent — the chat window is closed and the approval template isn't approved on Meta yet.";
    default:
      return "Not sent — WhatsApp didn't accept the message.";
  }
}

export const checkupService = {
  list: async (params: { status: CheckupTab; q?: string; limit?: number; skip?: number }) =>
    http.get<CheckupListResponse>(API_ENDPOINTS.checkups.list, {
      params: { ...params, q: params.q?.trim() || undefined },
    }),

  schedule: async (id: string, payload: { doctor_id: string; slot_id: string; notify: boolean }) =>
    http.post<{ request: CheckupRequest; notify_status: string | null }>(API_ENDPOINTS.checkups.schedule(id), payload),

  notify: async (id: string) => http.post<{ request: CheckupRequest }>(API_ENDPOINTS.checkups.notify(id), {}),

  close: async (id: string, reason: string) =>
    http.post<{ request: CheckupRequest }>(API_ENDPOINTS.checkups.close(id), { reason }),

  reopen: async (id: string) => http.post<{ request: CheckupRequest }>(API_ENDPOINTS.checkups.reopen(id), {}),
};
