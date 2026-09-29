import { http } from "@/src/services/http";
import { API_ENDPOINTS } from "@/src/config/endpoints";

// ---------- Types ----------

export interface ReportDateRange {
  start_date?: string;
  end_date?: string;
}

export interface NoShowRateReport {
  start_date: string;
  end_date: string;
  total_confirmed_appointments: number;
  no_show_count: number;
  no_show_rate_percent: number;
}

export interface DoctorLoadEntry {
  doctor_id: string;
  doctor_name: string;
  total: number;
  status_wise: Record<string, number>;
}

export interface DoctorLoadReport {
  start_date: string;
  end_date: string;
  doctors: DoctorLoadEntry[];
}

export interface FollowUpConversionReport {
  start_date: string;
  end_date: string;
  total_completed_appointments: number;
  follow_up_scheduled_count: number;
  follow_up_conversion_rate_percent: number;
}

interface FeedbackPatient {
  full_name: string;
  phone: string;
  uhid?: string | null;
}

interface FeedbackDoctor {
  full_name: string;
}

/** The rated visit — only the fields /feedback joins in. */
interface FeedbackAppointment {
  reference_code?: string | null;
  appointment_datetime?: string | null;
}

export interface RawFeedbackEntry {
  _id: string;
  appointment_id: string;
  rating: number;
  comment: string | null;
  /** Joined with preserveNullAndEmptyArrays — absent if the record was deleted. */
  patient?: FeedbackPatient | null;
  doctor?: FeedbackDoctor | null;
  appointment?: FeedbackAppointment | null;
  created_at: string;
}

export interface FeedbackEntry {
  id: string;
  appointment_id: string;
  rating: number;
  comment: string | null;
  patient: FeedbackPatient | null;
  doctor: FeedbackDoctor | null;
  reference_code: string | null;
  appointment_datetime: string | null;
  created_at: string;
}

// ---------- Service ----------

function cleanParams<T extends object>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
  );
}

function mapFeedback(raw: RawFeedbackEntry): FeedbackEntry {
  return {
    id: raw._id,
    appointment_id: raw.appointment_id,
    rating: raw.rating,
    comment: raw.comment,
    patient: raw.patient ?? null,
    doctor: raw.doctor ?? null,
    reference_code: raw.appointment?.reference_code ?? null,
    appointment_datetime: raw.appointment?.appointment_datetime ?? null,
    created_at: raw.created_at,
  };
}

export const reportsService = {
  noShowRate: (range: ReportDateRange & { doctor_id?: string }) =>
    http.get<NoShowRateReport>(API_ENDPOINTS.reports.noShowRate, { params: cleanParams(range) }),

  doctorLoad: (range: ReportDateRange & { doctor_id?: string }) =>
    http.get<DoctorLoadReport>(API_ENDPOINTS.reports.doctorLoad, { params: cleanParams(range) }),

  followUpConversion: (range: ReportDateRange & { doctor_id?: string }) =>
    http.get<FollowUpConversionReport>(API_ENDPOINTS.reports.followUpConversion, {
      params: cleanParams(range),
    }),

  /** Pass a range to count only feedback submitted within it; omit for all-time. */
  feedback: async (doctorId?: string, range: ReportDateRange = {}) => {
    const res = await http.get<{ count: number; feedback: RawFeedbackEntry[] }>(
      API_ENDPOINTS.feedback.list,
      { params: cleanParams({ doctor_id: doctorId, ...range }) }
    );
    return { ...res, data: { ...res.data, feedback: res.data.feedback.map(mapFeedback) } };
  },
};
