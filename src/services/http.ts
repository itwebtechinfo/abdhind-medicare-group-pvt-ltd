import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { apiClient, publicApiClient } from "./api-client";
import type { ApiEnvelope } from "@/src/types/api";

function createHttpMethods(instance: AxiosInstance) {
  return {
    get: async <T>(url: string, config?: AxiosRequestConfig) => {
      const res = await instance.get<ApiEnvelope<T>>(url, config);
      return res.data;
    },
    post: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => {
      const res = await instance.post<ApiEnvelope<T>>(url, body, config);
      return res.data;
    },
    put: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => {
      const res = await instance.put<ApiEnvelope<T>>(url, body, config);
      return res.data;
    },
    patch: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => {
      const res = await instance.patch<ApiEnvelope<T>>(url, body, config);
      return res.data;
    },
    delete: async <T>(url: string, config?: AxiosRequestConfig) => {
      const res = await instance.delete<ApiEnvelope<T>>(url, config);
      return res.data;
    },
  };
}

/** Authenticated requests — Bearer token attached, 401s auto-refresh-retry. */
export const http = createHttpMethods(apiClient);

/** Unauthenticated requests (login/refresh) — no interceptors, can't recurse into themselves. */
export const publicHttp = createHttpMethods(publicApiClient);
