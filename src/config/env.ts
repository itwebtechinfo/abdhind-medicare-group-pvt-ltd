export const env = {
  // Host only — every endpoint in API_ENDPOINTS already includes the "/api/v1" prefix.
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.abdhindmedicare.com",
  apiTimeoutMs: Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 15000),
} as const;
