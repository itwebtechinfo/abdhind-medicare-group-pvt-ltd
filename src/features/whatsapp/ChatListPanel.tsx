"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";
import { cn } from "@/src/lib/utils";
import { displayTimeOnly, whatsappService, type ApiConversation } from "./whatsapp";

const PAGE_SIZE = 30;
const POLL_MS = 8000;

const HANDLER_FILTERS: { value: boolean | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  { value: false, label: "Bot" },
  { value: true, label: "Human" },
];

function initials(name: string | null, phone: string): string {
  const trimmed = name?.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return phone.slice(-2);
}

interface ChatListPanelProps {
  selectedPhone: string | null;
  onSelect: (conversation: ApiConversation) => void;
}

export function ChatListPanel({ selectedPhone, onSelect }: ChatListPanelProps) {
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [tag, setTag] = useState("");
  const [humanMode, setHumanMode] = useState<boolean | undefined>(undefined);

  const { data, isFetching, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["whatsapp", "conversations", { search, unreadOnly, tag, humanMode }],
    queryFn: ({ pageParam }) =>
      whatsappService.listConversations({
        search: search.trim() || undefined,
        unread_only: unreadOnly || undefined,
        tag: tag.trim() || undefined,
        human_mode: humanMode,
        limit: PAGE_SIZE,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const fetchedCount = allPages.reduce((sum, page) => sum + page.data.conversations.length, 0);
      return fetchedCount < lastPage.data.count ? fetchedCount : undefined;
    },
    refetchInterval: POLL_MS,
  });

  // Polling re-fetches every loaded page at its original offset; if the list's
  // order shifts between polls (e.g. a new inbound message re-sorts it), the
  // same conversation can land in two offset windows — dedupe by id.
  const items: ApiConversation[] = [];
  const seenIds = new Set<string>();
  for (const page of data?.pages ?? []) {
    for (const conversation of page.data.conversations) {
      if (seenIds.has(conversation.conversation_id)) continue;
      seenIds.add(conversation.conversation_id);
      items.push(conversation);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-2 border-b border-border p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or phone…"
            className="pl-8"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Switch checked={unreadOnly} onCheckedChange={setUnreadOnly} aria-label="Unread only" />
            Unread only
          </label>
          <Input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Filter by tag…"
            className="h-7 w-32 text-xs"
          />
        </div>
        <div className="flex gap-1.5">
          {HANDLER_FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setHumanMode(filter.value)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                humanMode === filter.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background text-muted-foreground hover:bg-accent"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.length === 0 && !isLoading && (
          <p className="p-6 text-center text-sm text-muted-foreground">No conversations found.</p>
        )}
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {items.map((conversation) => (
          <button
            key={conversation.conversation_id}
            type="button"
            onClick={() => onSelect(conversation)}
            className={cn(
              "flex w-full items-start gap-3 border-b border-border/60 px-3 py-3 text-left transition-colors hover:bg-accent",
              selectedPhone === conversation.conversation_id && "bg-accent"
            )}
          >
            <Avatar>
              <AvatarFallback>{initials(conversation.patient_name, conversation.phone)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium">
                  {conversation.patient_name ?? conversation.phone}
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {displayTimeOnly(conversation.last_message_time)}
                </span>
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <span className="truncate text-xs text-muted-foreground">
                  {conversation.last_message_direction === "outbound" ? "You: " : ""}
                  {conversation.last_message_preview || "—"}
                </span>
                {conversation.unread_count > 0 && (
                  <Badge className="h-5 shrink-0 justify-center rounded-full px-1.5">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <Badge variant={conversation.human_mode ? "warning" : "secondary"} className="text-[10px]">
                  {conversation.human_mode ? "Human" : "Bot"}
                </Badge>
                {conversation.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px]">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </button>
        ))}

        {hasNextPage && (
          <div className="p-3 text-center">
            <Button size="sm" variant="outline" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
              {isFetchingNextPage && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Load more
            </Button>
          </div>
        )}
        {isFetching && !isLoading && !isFetchingNextPage && (
          <p className="py-2 text-center text-[11px] text-muted-foreground">Refreshing…</p>
        )}
      </div>
    </div>
  );
}
