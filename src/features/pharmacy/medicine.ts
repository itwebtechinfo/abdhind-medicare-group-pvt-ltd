import { z } from "zod";
import { http } from "@/src/services/http";
import { API_ENDPOINTS } from "@/src/config/endpoints";

// ---------- Types ----------

export interface RawApiMedicine {
  _id: string;
  name: string;
  unit: string;
  price: number;
  active: boolean;
}

export interface ApiMedicine {
  id: string;
  name: string;
  unit: string;
  price: number;
  active: boolean;
}

export interface CreateMedicinePayload {
  name: string;
  unit: string;
  price: number;
}

export type UpdateMedicinePayload = Partial<CreateMedicinePayload> & { active?: boolean };

export interface DispenseItemInput {
  medicine_id: string;
  quantity: number;
}

export interface DispenseItemRecord {
  medicine_id: string;
  medicine_name: string;
  unit: string;
  unit_price: number;
  quantity: number;
}

export interface DispenseRecord {
  appointment_id: string;
  patient_id: string;
  items: DispenseItemRecord[];
  dispensed_by: { user_id: string; role: string; name: string };
}

// ---------- Schema ----------

export const createMedicineSchema = z.object({
  name: z.string().trim().min(1, "Medicine name is required"),
  unit: z.string().trim().min(1, "Unit is required"),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
});

export type CreateMedicineFormValues = z.infer<typeof createMedicineSchema>;

export const editMedicineSchema = createMedicineSchema.partial();

export type EditMedicineFormValues = z.infer<typeof editMedicineSchema>;

export const EMPTY_MEDICINE_VALUES: CreateMedicineFormValues = { name: "", unit: "", price: 0 };

// ---------- Service ----------

function mapMedicine(raw: RawApiMedicine): ApiMedicine {
  return { id: raw._id, name: raw.name, unit: raw.unit, price: raw.price, active: raw.active };
}

export const medicineService = {
  list: async () => {
    const res = await http.get<{ count: number; medicines: RawApiMedicine[] }>(
      API_ENDPOINTS.medicines.list
    );
    return { ...res, data: { ...res.data, medicines: res.data.medicines.map(mapMedicine) } };
  },

  create: async (payload: CreateMedicinePayload) => {
    const res = await http.post<{ medicine: RawApiMedicine }>(
      API_ENDPOINTS.medicines.list,
      payload
    );
    return { ...res, data: { medicine: mapMedicine(res.data.medicine) } };
  },

  update: async (id: string, payload: UpdateMedicinePayload) => {
    const res = await http.patch<{ medicine: RawApiMedicine }>(
      API_ENDPOINTS.medicines.detail(id),
      payload
    );
    return { ...res, data: { medicine: mapMedicine(res.data.medicine) } };
  },
};

export const dispenseService = {
  dispense: (appointmentId: string, items: DispenseItemInput[]) =>
    http.post<{ dispense: DispenseRecord }>(API_ENDPOINTS.appointments.dispense(appointmentId), {
      items,
    }),

  list: (appointmentId: string) =>
    http.get<{ dispenses: DispenseRecord[] }>(API_ENDPOINTS.appointments.dispense(appointmentId)),
};
