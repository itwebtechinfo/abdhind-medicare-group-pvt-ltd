import { z } from "zod";

/** Indian mobile numbers: 10 digits, starts 6-9. Intl numbers out of scope for now. */
export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

export const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(INDIAN_MOBILE_REGEX, "Enter a valid 10-digit mobile number"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
