import { env } from "@/src/config/env";

/**
 * Backend stores prescription/lab-result files as relative paths like
 * "uploads/prescriptions/1785323153897.jpg". Serving them is a public,
 * unauthenticated GET at /api/v1/uploads/<sub_folder>/<file_name>.
 */
export function resolveUploadUrl(path: string): string {
  return `${env.apiBaseUrl}/api/v1/uploads/${path.replace(/^uploads\//, "")}`;
}
