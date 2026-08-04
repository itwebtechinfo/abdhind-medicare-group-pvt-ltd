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
  doctors: DoctorLoadEntry[];
}

export interface FollowUpConversionReport {
  total_completed_appointments: number;
  follow_up_scheduled_count: number;
  follow_up_conversion_rate_percent: number;
}

export interface RawFeedbackEntry {
  _id: string;
  appointment_id: string;
  rating: number;
  comment: string | null;
  patient: { full_name: string; phone: string };
  doctor: { full_name: string };
  created_at: string;
}

export interface FeedbackEntry {
  id: string;
  appointment_id: string;
  rating: number;
  comment: string | null;
  patient: { full_name: string; phone: string };
  doctor: { full_name: string };
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
    patient: raw.patient,
    doctor: raw.doctor,
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

  feedback: async (doctorId?: string) => {
    const res = await http.get<{ count: number; feedback: RawFeedbackEntry[] }>(
      API_ENDPOINTS.feedback.list,
      { params: cleanParams({ doctor_id: doctorId }) }
    );
    return { ...res, data: { ...res.data, feedback: res.data.feedback.map(mapFeedback) } };
  },
};
