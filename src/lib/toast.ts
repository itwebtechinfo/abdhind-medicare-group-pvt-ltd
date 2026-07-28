import { toast as sonnerToast } from "sonner";

/**
 * Thin wrapper around sonner's toast() so call sites depend on this module
 * instead of "sonner" directly, and every variant gets consistent defaults.
 *
 * Plain functions (not a hook) on purpose — this needs to be callable from
 * services/api-client.ts's Axios interceptor, which isn't a React component.
 */
export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, { description }),
  error: (message: string, description?: string) =>
    sonnerToast.error(message, { description }),
  warning: (message: string, description?: string) =>
    sonnerToast.warning(message, { description }),
  info: (message: string, description?: string) =>
    sonnerToast.info(message, { description }),
};
