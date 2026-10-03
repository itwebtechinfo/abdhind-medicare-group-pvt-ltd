"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ChatPanel } from "@/src/features/inbox/ChatPanel";
import { ConversationList } from "@/src/features/inbox/ConversationList";
import { InboxProvider, useInbox } from "@/src/features/inbox/InboxProvider";
import { PatientPanel } from "@/src/features/inbox/PatientPanel";

const PANEL_KEY = "inbox.patientPanel";
const panelListeners = new Set<() => void>();

/** The patient panel's open/closed choice, remembered per browser. */
const panelPref = {
  get(): boolean {
    try {
      return window.localStorage.getItem(PANEL_KEY) !== "closed";
    } catch {
      return true;
    }
  },
  set(open: boolean) {
    try {
      window.localStorage.setItem(PANEL_KEY, open ? "open" : "closed");
    } catch {
      /* private mode - just not remembered */
    }
    panelListeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    panelListeners.add(listener);
    return () => panelListeners.delete(listener);
  },
};

const WIDE = "(min-width: 1280px)";
/** Mount the side panel only where it's shown - a hidden copy would still fetch. */
function useWide(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(WIDE);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(WIDE).matches,
    () => true
  );
}

export default function WhatsappInboxPage() {
  // Deep links: /whatsapp?c=+91… (bell, mentions) and the older ?phone= (Patients page).
  const params = useSearchParams();
  const initial = params.get("c") ?? params.get("phone");
  return (
    <InboxProvider initialOpenId={initial}>
      <InboxLayout />
    </InboxProvider>
  );
}

function InboxLayout() {
  const { state, openChat } = useInbox();
  const router = useRouter();
  const params = useSearchParams();
  const panelOpen = useSyncExternalStore(panelPref.subscribe, panelPref.get, () => true);
  const [mobilePanel, setMobilePanel] = useState(false);
  const wide = useWide();

  // Keep the URL in step with the open chat so a reload / shared link reopens it.
  useEffect(() => {
    const current = params.get("c");
    if (state.openId && current !== state.openId) router.replace(`/whatsapp?c=${encodeURIComponent(state.openId)}`, { scroll: false });
    if (!state.openId && (current || params.get("phone"))) router.replace("/whatsapp", { scroll: false });
  }, [state.openId, params, router]);

  const togglePanel = (open: boolean) => panelPref.set(open);

  const chatOpen = Boolean(state.openId);
  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] min-h-[520px] w-full max-w-[1800px] overflow-hidden rounded-2xl border border-[#E3E9E5] bg-card shadow-sm dark:border-border">
      <div className={cn("h-full min-h-0 w-full shrink-0 border-[#E3E9E5] dark:border-border lg:w-[360px] lg:border-r", chatOpen && "hidden lg:block")}>
        <ConversationList />
      </div>

      <div className={cn("relative h-full min-h-0 min-w-0 flex-1", !chatOpen && "hidden lg:block")}>
        {chatOpen ? (
          <ChatPanel
            onBack={() => openChat(null)}
            onShowPanel={() => (wide ? togglePanel(true) : setMobilePanel(true))}
            panelOpen={panelOpen}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-[#EFEAE2]/50 text-muted-foreground dark:bg-background">
            <MessageCircle className="h-10 w-10" />
            <p className="text-sm">Select a conversation to start replying.</p>
          </div>
        )}
      </div>

      {wide && chatOpen && (state.open || state.openError) && panelOpen && (
        <div className="h-full min-h-0 w-[340px] shrink-0 border-l border-[#E3E9E5] dark:border-border">
          <PatientPanel onCollapse={() => togglePanel(false)} />
        </div>
      )}

      {/* Below xl the panel slides over the chat. */}
      {!wide && chatOpen && (state.open || state.openError) && mobilePanel && (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Patient details">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={() => setMobilePanel(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-[380px] shadow-2xl">
            <PatientPanel mobile onCollapse={() => setMobilePanel(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
