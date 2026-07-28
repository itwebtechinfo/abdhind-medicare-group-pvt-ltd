import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { authService } from "@/src/lib/auth/auth-service";
import { env } from "@/src/config/env";
import { toast } from "@/src/lib/toast";
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
      toast.error("Session expired", "Please sign in again to continue.");
      return Promise.reject(normalizeApiError(error));
    }

    const normalized = normalizeApiError(error);

    // Network failures and server errors are unexpected infra problems —
    // toast them automatically. 4xx errors (validation, bad request, etc.)
    // are left for the calling form/component to show inline, same as the
    // login form's wrong-credentials error.
    const isNetworkError = !error.response;
    const isServerError = (error.response?.status ?? 0) >= 500;
    if (isNetworkError || isServerError) {
      toast.error(isNetworkError ? "Network error" : "Server error", normalized.error.message);
    }

    return Promise.reject(normalized);
  }
);
