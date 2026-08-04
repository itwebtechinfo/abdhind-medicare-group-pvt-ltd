import { z } from "zod";
import { http } from "@/src/services/http";
import { API_ENDPOINTS } from "@/src/config/endpoints";

// ---------- Types ----------

export interface RawApiLabTest {
  _id: string;
  name: string;
  price: number;
  active: boolean;
}

export interface ApiLabTest {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

export interface CreateLabTestPayload {
  name: string;
  price: number;
}

export type UpdateLabTestPayload = Partial<CreateLabTestPayload> & { active?: boolean };

export type LabOrderStatus = "ORDERED" | "COMPLETED";

export interface RawApiLabOrder {
  _id: string;
  appointment_id: string;
  patient_id: string;
  test_id: string;
  test_name: string;
  status: LabOrderStatus;
  ordered_by: { user_id: string; role: string; name: string };
  result_text: string | null;
  result_file: string | null;
  completed_at: number | null;
}

export interface ApiLabOrder {
  id: string;
  appointment_id: string;
  patient_id: string;
  test_id: string;
  test_name: string;
  status: LabOrderStatus;
  ordered_by: { user_id: string; role: string; name: string };
  result_text: string | null;
  result_file: string | null;
  completed_at: number | null;
}

// ---------- Schema ----------

export const createLabTestSchema = z.object({
  name: z.string().trim().min(1, "Test name is required"),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
});

export type CreateLabTestFormValues = z.infer<typeof createLabTestSchema>;

export const editLabTestSchema = createLabTestSchema.partial();

export type EditLabTestFormValues = z.infer<typeof editLabTestSchema>;

export const EMPTY_LAB_TEST_VALUES: CreateLabTestFormValues = { name: "", price: 0 };

// ---------- Service ----------

function mapLabTest(raw: RawApiLabTest): ApiLabTest {
  return { id: raw._id, name: raw.name, price: raw.price, active: raw.active };
}

function mapLabOrder(raw: RawApiLabOrder): ApiLabOrder {
  return {
    id: raw._id,
    appointment_id: raw.appointment_id,
    patient_id: raw.patient_id,
    test_id: raw.test_id,
    test_name: raw.test_name,
    status: raw.status,
    ordered_by: raw.ordered_by,
    result_text: raw.result_text,
    result_file: raw.result_file,
    completed_at: raw.completed_at,
  };
}

export const labTestService = {
  list: async () => {
    const res = await http.get<{ count: number; lab_tests: RawApiLabTest[] }>(
      API_ENDPOINTS.labTests.list
    );
    return { ...res, data: { ...res.data, lab_tests: res.data.lab_tests.map(mapLabTest) } };
  },

  create: async (payload: CreateLabTestPayload) => {
    const res = await http.post<{ lab_test: RawApiLabTest }>(API_ENDPOINTS.labTests.list, payload);
    return { ...res, data: { lab_test: mapLabTest(res.data.lab_test) } };
  },

  update: async (id: string, payload: UpdateLabTestPayload) => {
    const res = await http.patch<{ lab_test: RawApiLabTest }>(
      API_ENDPOINTS.labTests.detail(id),
      payload
    );
    return { ...res, data: { lab_test: mapLabTest(res.data.lab_test) } };
  },
};

export const labOrderService = {
  listForAppointment: async (appointmentId: string) => {
    const res = await http.get<{ lab_orders: RawApiLabOrder[] }>(
      API_ENDPOINTS.appointments.labOrders(appointmentId)
    );
    return { ...res, data: { lab_orders: res.data.lab_orders.map(mapLabOrder) } };
  },

  order: async (appointmentId: string, testId: string) => {
    const res = await http.post<{ lab_order: RawApiLabOrder }>(
      API_ENDPOINTS.appointments.labOrders(appointmentId),
      { test_id: testId }
    );
    return { ...res, data: { lab_order: mapLabOrder(res.data.lab_order) } };
  },

  recordResult: async (orderId: string, resultText: string, resultFile?: File) => {
    const form = new FormData();
    form.append("result_text", resultText);
    if (resultFile) form.append("result_file", resultFile);
    const res = await http.post<{ lab_order: RawApiLabOrder }>(
      API_ENDPOINTS.labOrders.result(orderId),
      form
    );
    return { ...res, data: { lab_order: mapLabOrder(res.data.lab_order) } };
  },
};
