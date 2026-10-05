import { API_ENDPOINTS } from "@/src/config/endpoints";
import { apiClient } from "@/src/services/api-client";
import { toast } from "@/src/lib/toast";

/** A short-lived (~10 min) signed URL for a private upload (lab_results, whatsapp_media, prescriptions). */
export async function getSignedUploadUrl(path: string): Promise<string> {
  const res = await apiClient.post<{ data: { url: string } }>(API_ENDPOINTS.uploads.sign, { path });
  return res.data.data.url;
}

/**
 * Opens a private upload in a new tab. The tab is opened synchronously inside
 * the click (so Safari/iOS popup blocking allows it) and pointed at the signed
 * URL once it arrives - a plain <a href> can't carry the auth header.
 */
export async function openPrivateUpload(path: string): Promise<void> {
  const tab = window.open("about:blank", "_blank");
  try {
    const url = await getSignedUploadUrl(path);
    if (tab) tab.location.href = url;
    else window.location.href = url;
  } catch {
    tab?.close();
    toast.error("Couldn't open the file. Please try again.");
  }
}
