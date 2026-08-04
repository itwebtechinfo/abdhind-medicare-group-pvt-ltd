import { http } from "@/src/services/http";
import { API_ENDPOINTS } from "@/src/config/endpoints";
import { mapAppointment } from "@/src/features/appointments/appointment";
import type { ApiAppointment, RawApiAppointment } from "@/src/features/appointments/appointment";

// ---------- Types ----------

export interface RawDashboardToday {
  date: string;
  total: number;
  status_wise: Record<string, number>;
  appointments: RawApiAppointment[];
}

export interface DashboardToday {
  date: string;
  total: number;
  status_wise: Record<string, number>;
  appointments: ApiAppointment[];
}

// ---------- Service ----------

export const dashboardService = {
  today: async () => {
    const res = await http.get<RawDashboardToday>(API_ENDPOINTS.dashboard.today);
    return {
      ...res,
      data: { ...res.data, appointments: res.data.appointments.map(mapAppointment) },
    };
  },
};

/** Root-level convenience endpoints (not under /api/v1) for the doctor's quick-action panel. */
export const doctorQuickService = {
  pending: async () => {
    const res = await http.get<{ count: number; appointments: RawApiAppointment[] }>(
      API_ENDPOINTS.doctorQuick.pending
    );
    return { ...res, data: { ...res.data, appointments: res.data.appointments.map(mapAppointment) } };
  },

  approve: async (appointmentId: string) => {
    const res = await http.post<{ appointment: RawApiAppointment }>(
      API_ENDPOINTS.doctorQuick.approve,
      { appointment_id: appointmentId }
    );
    return { ...res, data: { appointment: mapAppointment(res.data.appointment) } };
  },

  exitHumanMode: (phoneNumber: string) =>
    http.post<null>(API_ENDPOINTS.doctorQuick.exitHumanMode, { phone_number: phoneNumber }),
};
