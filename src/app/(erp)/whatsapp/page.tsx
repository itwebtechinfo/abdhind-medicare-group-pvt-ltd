"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { ChatListPanel } from "@/src/features/whatsapp/ChatListPanel";
import { ChatWindow } from "@/src/features/whatsapp/ChatWindow";
import { whatsappService, type ApiConversation } from "@/src/features/whatsapp/whatsapp";
import { cn } from "@/src/lib/utils";

/** Cheap `limit: 1` calls — only `data.count` (the pre-slice total, see
 * whatsappService.listConversations) is read, so these never fetch a real
 * page of conversations just to show a header stat. */
function useConversationCounts() {
  const { data: totalData } = useQuery({
    queryKey: ["whatsapp", "conversations", "header-count", "total"],
    queryFn: () => whatsappService.listConversations({ limit: 1 }),
    refetchInterval: 8000,
  });
  const { data: unreadData } = useQuery({
    queryKey: ["whatsapp", "conversations", "header-count", "unread"],
    queryFn: () => whatsappService.listConversations({ unread_only: true, limit: 1 }),
    refetchInterval: 8000,
  });
  return { total: totalData?.data.count ?? 0, unread: unreadData?.data.count ?? 0 };
}

export default function WhatsappInboxPage() {
  const [selected, setSelected] = useState<ApiConversation | null>(null);
  const { total, unread } = useConversationCounts();

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] min-h-[560px] w-full max-w-[1600px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-gradient-to-r from-primary/[0.06] to-transparent px-5 py-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MessageCircle className="h-[18px] w-[18px]" />
        </div>
        <h1 className="truncate text-base font-semibold leading-tight">WhatsApp Inbox</h1>
        <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            {total} conversation{total === 1 ? "" : "s"}
          </Badge>
          {unread > 0 && (
            <Badge variant="warning" className="font-normal">
              {unread} unread
            </Badge>
          )}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[340px_1fr]">
        <div className={cn("h-full min-h-0 overflow-hidden md:border-r md:border-border", selected && "hidden md:block")}>
          <ChatListPanel selectedPhone={selected?.conversation_id ?? null} onSelect={setSelected} />
        </div>
        <div className={cn("h-full min-h-0 overflow-hidden", !selected && "hidden md:flex")}>
          {selected ? (
            <ChatWindow conversation={selected} onBack={() => setSelected(null)} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <MessageCircle className="h-10 w-10" />
              <p className="text-sm">Select a conversation to start replying.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
