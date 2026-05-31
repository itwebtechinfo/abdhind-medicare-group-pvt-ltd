import { authService } from "./auth-service";

export type RequestInterceptor = (
  init: RequestInit
) => RequestInit | Promise<RequestInit>;

/**
 * Ready for future API client wiring — attaches Bearer token to requests.
 */
export const authRequestInterceptor: RequestInterceptor = async (init) => {
  const token = authService.getAccessToken();
  if (!token) return init;

  const headers = new Headers(init.headers);
  if (!headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return { ...init, headers };
};

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const enriched = await authRequestInterceptor(init);
  const response = await fetch(input, enriched);

  if (response.status === 401) {
    const refreshed = await authService.refreshTokens();
    if (!refreshed) {
      authService.logout();
    }
  }

  return response;
}
