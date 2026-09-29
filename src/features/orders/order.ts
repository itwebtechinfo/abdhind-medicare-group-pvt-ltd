import { http } from "@/src/services/http";
import { API_ENDPOINTS } from "@/src/config/endpoints";

// ---------- Types ----------

export type OrderStatus = "NEW" | "CONFIRMED" | "DISPATCHED" | "DELIVERED" | "CANCELLED";

export const ORDER_STATUSES: OrderStatus[] = ["NEW", "CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"];

/** Mirrors ALLOWED_TRANSITIONS in routes/orders.py — forward-only, DELIVERED/CANCELLED are final.
 * The backend is the authority (it rejects anything else); this only decides which buttons to show. */
export const NEXT_ORDER_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  NEW: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export interface OrderStatusHistoryEntry {
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_by_name: string | null;
  changed_by_role: string | null;
  note: string | null;
  /** Epoch ms. */
  changed_at: number;
}

export interface RawProductOrder {
  _id: string;
  reference_code: string;
  source: string;
  status: OrderStatus;
  customer_phone: string;
  customer_name?: string | null;
  patient_id?: string | null;
  product_id: string;
  product_name: string;
  mrp?: number | null;
  unit_price: number;
  quantity: number;
  total_price: number;
  delivery_address: string;
  staff_note?: string | null;
  status_history?: OrderStatusHistoryEntry[];
  /** Display string ("DD-MM-YYYY HH:MM") — the API formats created_at. */
  created_at: string;
  /** Epoch ms. */
  updated_at?: number | null;
}

export interface ProductOrder {
  id: string;
  reference_code: string;
  source: string;
  status: OrderStatus;
  customer_phone: string;
  customer_name: string | null;
  patient_id: string | null;
  product_id: string;
  product_name: string;
  mrp: number | null;
  unit_price: number;
  quantity: number;
  total_price: number;
  delivery_address: string;
  staff_note: string | null;
  status_history: OrderStatusHistoryEntry[];
  created_at: string;
  updated_at: number | null;
}

export interface UpdateOrderPayload {
  status?: OrderStatus;
  /** null clears the note. */
  staff_note?: string | null;
}

// ---------- Service ----------

export function mapOrder(raw: RawProductOrder): ProductOrder {
  return {
    id: raw._id,
    reference_code: raw.reference_code,
    source: raw.source,
    status: raw.status,
    customer_phone: raw.customer_phone,
    customer_name: raw.customer_name ?? null,
    patient_id: raw.patient_id ?? null,
    product_id: raw.product_id,
    product_name: raw.product_name,
    mrp: raw.mrp ?? null,
    unit_price: raw.unit_price,
    quantity: raw.quantity,
    total_price: raw.total_price,
    delivery_address: raw.delivery_address,
    staff_note: raw.staff_note ?? null,
    status_history: raw.status_history ?? [],
    created_at: raw.created_at,
    updated_at: raw.updated_at ?? null,
  };
}

export const orderService = {
  list: async (status?: OrderStatus) => {
    const res = await http.get<{ count: number; orders: RawProductOrder[] }>(
      API_ENDPOINTS.productOrders.list,
      { params: status ? { status } : undefined }
    );
    return { ...res, data: { ...res.data, orders: res.data.orders.map(mapOrder) } };
  },

  update: async (id: string, payload: UpdateOrderPayload) => {
    const res = await http.patch<{ order: RawProductOrder }>(API_ENDPOINTS.productOrders.detail(id), payload);
    return { ...res, data: { order: mapOrder(res.data.order) } };
  },
};
