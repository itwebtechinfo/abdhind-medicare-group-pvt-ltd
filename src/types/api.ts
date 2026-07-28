/**
 * Matches the backend's actual response envelope (FastAPI `respond()` helper):
 * every response is { status, msg, data }, with `error` present on failures.
 * There's no `success` boolean — status code (and presence of `error`) is
 * how you tell success from failure.
 */
export interface ApiEnvelope<T> {
  status: number;
  msg: string;
  data: T;
  error?: string;
}

/** Normalized shape for a failed request, built from whatever axios gives us. */
export interface NormalizedApiError {
  status: number;
  msg: string;
  error: string;
}
