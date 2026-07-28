import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { authService } from "@/src/lib/auth/auth-service";
import { env } from "@/src/config/env";
import type { ApiErrorResponse } from "@/src/types/api";

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
});

apiClient.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  if (token && !config.headers.has("Authorization")) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

function normalizeApiError(error: AxiosError): ApiErrorResponse {
  const status = error.response?.status;
  const data = error.response?.data as { message?: string } | undefined;

  return {
    success: false,
    data: null,
    error: {
      code: status ? String(status) : error.code ?? "NETWORK_ERROR",
      message: data?.message ?? error.message ?? "Something went wrong. Please try again.",
    },
    message: data?.message ?? error.message,
  };
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshed = await authService.refreshTokens();
      if (refreshed) {
        originalRequest.headers.set("Authorization", `Bearer ${refreshed.tokens.accessToken}`);
        return apiClient(originalRequest);
      }

      authService.logout();
    }

    return Promise.reject(normalizeApiError(error));
  }
);
