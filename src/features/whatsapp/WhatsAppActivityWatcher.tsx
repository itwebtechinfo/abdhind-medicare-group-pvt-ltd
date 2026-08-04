"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePermission } from "@/src/hooks/usePermission";
import { toast } from "@/src/lib/toast";
import { whatsappService } from "./whatsapp";

const POLL_MS = 20000;
const STORAGE_KEY = "whatsapp_activity_last_seen";

function getLastSeen(): number {
  if (typeof window === "undefined") return Date.now();
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored ? Number(stored) : Date.now();
}

function setLastSeen(ts: number) {
  window.localStorage.setItem(STORAGE_KEY, String(ts));
}

/**
 * Renders nothing — silently polls for WhatsApp template approvals/
 * rejections and completed broadcasts the admin hasn't seen yet, and toasts
 * them, so those events surface even when nobody's sitting on the Templates
 * or Broadcast page. Scoped to WhatsApp only rather than the shared topbar
 * bell — no app-wide notification system exists to hook into, and building
 * one is a separate, bigger feature than "the WhatsApp module is missing
 * this." Only polls for roles that can actually create templates/
 * broadcasts (the events this watches for).
 */
export function WhatsAppActivityWatcher() {
  const { canAction } = usePermission();
  const enabled = canAction("whatsapp_inbox", "broadcast");

  const { data } = useQuery({
    queryKey: ["whatsapp", "activity-watcher"],
    queryFn: () => whatsappService.getActivitySummary(getLastSeen()),
    enabled,
    refetchInterval: enabled ? POLL_MS : false,
  });

  useEffect(() => {
    if (!data) return;
    const { templates_approved, templates_rejected, broadcasts_completed } = data.data;

    if (templates_approved > 0) {
      toast.success(
        `${templates_approved} template${templates_approved === 1 ? "" : "s"} approved`,
        "Ready to use in your next broadcast."
      );
    }
    if (templates_rejected > 0) {
      toast.error(
        `${templates_rejected} template${templates_rejected === 1 ? "" : "s"} rejected`,
        "Check the Templates page for the reason."
      );
    }
    if (broadcasts_completed > 0) {
      toast.success(`${broadcasts_completed} broadcast${broadcasts_completed === 1 ? "" : "s"} finished sending`);
    }
    if (templates_approved > 0 || templates_rejected > 0 || broadcasts_completed > 0) {
      setLastSeen(Date.now());
    }
  }, [data]);

  return null;
}
