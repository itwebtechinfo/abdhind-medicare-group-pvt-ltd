import { http } from "@/src/services/http";
import { API_ENDPOINTS } from "@/src/config/endpoints";

// ---------- Types ----------

export interface RawApiDepartment {
  _id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface ApiDepartment {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface CreateDepartmentPayload {
  name: string;
  description?: string;
}

// ---------- Service ----------

function mapDepartment(raw: RawApiDepartment): ApiDepartment {
  return { id: raw._id, name: raw.name, description: raw.description, created_at: raw.created_at };
}

export const departmentService = {
  list: async () => {
    const res = await http.get<{ count: number; departments: RawApiDepartment[] }>(
      API_ENDPOINTS.departments.list
    );
    return { ...res, data: { ...res.data, departments: res.data.departments.map(mapDepartment) } };
  },

  create: async (payload: CreateDepartmentPayload) => {
    const res = await http.post<{ department: RawApiDepartment }>(
      API_ENDPOINTS.departments.list,
      payload
    );
    return { ...res, data: { department: mapDepartment(res.data.department) } };
  },
};
