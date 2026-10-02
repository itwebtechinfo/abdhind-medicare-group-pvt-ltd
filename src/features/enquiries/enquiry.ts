import { http, publicHttp } from "@/src/services/http";
import { API_ENDPOINTS } from "@/src/config/endpoints";

// ---------- Types ----------

/** NEW -> CONTACTED (called back) -> CONVERTED (booked) | CLOSED (no follow-up). */
export type EnquiryStatus = "NEW" | "CONTACTED" | "CONVERTED" | "CLOSED";

export const ENQUIRY_STATUSES: EnquiryStatus[] = ["NEW", "CONTACTED", "CONVERTED", "CLOSED"];

/** Must match PREFERRED_TIMES in routes/enquiries.py. */
export const PREFERRED_TIMES = [
  "Morning (9 AM - 12 PM)",
  "Afternoon (12 PM - 4 PM)",
  "Evening (4 PM - 8 PM)",
] as const;

export interface EnquiryActor {
  user_id: string;
  name: string | null;
  role: string;
}

export interface EnquiryNote {
  text: string;
  /** Epoch ms. */
  at: number;
  by: EnquiryActor;
}

export interface ApiEnquiry {
  _id: string;
  full_name: string;
  /** E.164, e.g. "+919311289091". */
  phone: string;
  preferred_time: string | null;
  message: string | null;
  source: string;
  status: EnquiryStatus;
  notes: EnquiryNote[];
  /** "DD-MM-YYYY HH:MM" IST display string. */
  created_at: string;
  status_changed_at?: number | null;
  status_changed_by?: EnquiryActor | null;
  /** A registered patient with the same phone, if any. */
  patient?: { _id: string; full_name: string; uhid: string } | null;
}

export type EnquiryCounts = Record<EnquiryStatus, number>;

export interface EnquiryListParams {
  status?: EnquiryStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PublicEnquiryPayload {
  full_name: string;
  phone: string;
  preferred_time: string;
  /** Honeypot — hidden from people; the backend silently drops anything that fills it. */
  website?: string;
}

// ---------- Service ----------

export const enquiryService = {
  /** Public website "Quick Enquiry" form — no auth. */
  submitPublic: (payload: PublicEnquiryPayload) => publicHttp.post<null>(API_ENDPOINTS.enquiries.public, payload),

  list: (params: EnquiryListParams) =>
    http.get<{ count: number; enquiries: ApiEnquiry[]; counts: EnquiryCounts }>(API_ENDPOINTS.enquiries.list, {
      params: { ...params, search: params.search || undefined },
    }),

  get: (id: string) => http.get<{ enquiry: ApiEnquiry }>(API_ENDPOINTS.enquiries.detail(id)),

  update: (id: string, payload: { status?: EnquiryStatus; note?: string }) =>
    http.patch<{ enquiry: ApiEnquiry }>(API_ENDPOINTS.enquiries.detail(id), payload),
};
