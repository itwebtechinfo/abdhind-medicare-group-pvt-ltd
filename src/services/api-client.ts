import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { authService } from "@/src/lib/auth/auth-service";
import { authEvents } from "@/src/lib/auth/auth-events";
import { env } from "@/src/config/env";
import { API_ENDPOINTS } from "@/src/config/endpoints";
import { toast } from "@/src/lib/toast";
import { loaderController } from "@/src/lib/loader/loader-controller";
import type { NormalizedApiError } from "@/src/types/api";

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
});

/**
 * No auth interceptors on purpose — used for login/refresh, which must never
 * trigger the 401-refresh-retry logic below on themselves (that would recurse).
 * It still gets the loader-tracking interceptors below so login/signup/refresh
 * show the global loader too.
 */
export const publicApiClient = axios.create({
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

// Loader tracking — one counted request per outgoing call, on both clients,
// independent of the auth/retry logic below. A retried request (after a
// token refresh) re-enters this same pair, so the loader correctly stays
// visible across the whole refresh+retry chain.
for (const instance of [apiClient, publicApiClient]) {
  instance.interceptors.request.use(
    (config) => {
      loaderController.requestStart();
      return config;
    },
    (error) => {
      loaderController.requestEnd();
      return Promise.reject(error);
    }
  );
  instance.interceptors.response.use(
    (response) => {
      loaderController.requestEnd();
      return response;
    },
    (error) => {
      loaderController.requestEnd();
      return Promise.reject(error);
    }
  );
}

export function normalizeApiError(error: AxiosError): NormalizedApiError {
  const data = error.response?.data as Partial<NormalizedApiError> | undefined;

  return {
    status: error.response?.status ?? 0,
    msg: data?.msg ?? error.message ?? "Something went wrong. Please try again.",
    error: data?.error ?? (error.response ? "Error" : "Network Error"),
  };
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    // The logout call is best-effort cleanup fired after we've already
    // cleared the local session — a 401 here is expected/harmless, not a
    // real session-expiry event. Don't retry or redirect for it.
    if (originalRequest?.url?.includes(API_ENDPOINTS.auth.logout)) {
      return Promise.reject(normalizeApiError(error));
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshed = await authService.refreshTokens();
      if (refreshed) {
        originalRequest.headers.set("Authorization", `Bearer ${refreshed.tokens.accessToken}`);
        return apiClient(originalRequest);
      }

      // Refresh token itself is dead — the whole session is over. Clear
      // locally (not authService.logout(), which would call the API and
      // could recurse back into this same 401 branch) and notify
      // AuthProvider so it drops its in-memory session immediately — the
      // route guards react to that and redirect on their own. A hard
      // `window.location.assign` here used to race that same client-side
      // redirect, which is what caused the repeated reload/flicker loop.
      authService.clearSession();
      toast.error("Session expired", "Please sign in again to continue.");
      authEvents.emitSessionEnded();
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
      toast.error(isNetworkError ? "Network error" : "Server error", normalized.msg);
    }

    return Promise.reject(normalized);
  }
);
