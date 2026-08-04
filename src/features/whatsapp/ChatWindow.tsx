"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bot,
  Download,
  History,
  Loader2,
  Paperclip,
  Search,
  Send,
  StickyNote,
  Tag,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Can } from "@/src/components/rbac/PermissionGate";
import { useAuth } from "@/src/hooks/useAuth";
import { usePermission } from "@/src/hooks/usePermission";
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";
import { AuditLogDialog } from "./AuditLogDialog";
import { MessageBubble } from "./MessageBubble";
import { MessageSearchDialog } from "./MessageSearchDialog";
import { NoteDialog } from "./NoteDialog";
import { TagsDialog } from "./TagsDialog";
import {
  isServiceWindowOpen,
  whatsappService,
  type ApiConversation,
  type ConversationAssignee,
  type ApiMessage,
} from "./whatsapp";

const PAGE_SIZE = 30;
const POLL_MS = 4000;
const NEAR_BOTTOM_PX = 80;

function initials(name: string | null, phone: string): string {
  const trimmed = name?.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return phone.slice(-2);
}

function dedupeById(messages: ApiMessage[]): ApiMessage[] {
  const seen = new Set<string>();
  return messages.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));
}

interface ChatWindowProps {
  conversation: ApiConversation;
  onBack?: () => void;
}

export function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const { canAction } = usePermission();
  const { user } = useAuth();
  const canReply = canAction("whatsapp_inbox", "reply") || canAction("whatsapp_inbox", "manage");
  const queryClient = useQueryClient();
  const phone = conversation.conversation_id;

  const [olderMessages, setOlderMessages] = useState<ApiMessage[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  // Mutation responses return the fresh human_mode/tags immediately — there's no
  // single-conversation GET to re-derive them from, and the parent's `conversation`
  // prop only refreshes on the list's next poll, so patch locally in the meantime.
  const [localPatch, setLocalPatch] = useState<{
    human_mode?: boolean;
    tags?: string[];
    assigned_to?: ConversationAssignee | null;
  }>({});

  useEffect(() => {
    setLocalPatch({});
  }, [phone]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);

  const invalidateConversations = () =>
    queryClient.invalidateQueries({ queryKey: ["whatsapp", "conversations"] });

  const latestQuery = useQuery({
    queryKey: ["whatsapp", "messages", phone, "latest"],
    queryFn: () => whatsappService.getMessages(phone, { limit: PAGE_SIZE }),
    refetchInterval: POLL_MS,
  });

  useEffect(() => {
    setOlderMessages([]);
    setCursor(null);
    setHasMore(false);
    atBottomRef.current = true;
  }, [phone]);

  useEffect(() => {
    if (!latestQuery.data) return;
    setCursor(latestQuery.data.data.next_before_cursor);
    setHasMore(latestQuery.data.data.has_more);
  }, [latestQuery.data]);

  const messages = useMemo(
    () => dedupeById([...olderMessages, ...(latestQuery.data?.data.messages ?? [])]),
    [olderMessages, latestQuery.data]
  );

  const loadOlderMutation = useMutation({
    mutationFn: () => whatsappService.getMessages(phone, { before: cursor ?? undefined, limit: PAGE_SIZE }),
    onSuccess: (res) => {
      setOlderMessages((prev) => dedupeById([...res.data.messages, ...prev]));
      setCursor(res.data.next_before_cursor);
      setHasMore(res.data.has_more);
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const markReadMutation = useMutation({
    mutationFn: () => whatsappService.markRead(phone),
    onSuccess: invalidateConversations,
  });

  useEffect(() => {
    markReadMutation.mutate();
    const onFocus = () => markReadMutation.mutate();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per conversation switch + window focus, not on every mutation identity change
  }, [phone]);

  useEffect(() => {
    if (!scrollRef.current) return;
    if (atBottomRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: (input: { text?: string; caption?: string; file?: File }) => whatsappService.sendMessage(phone, input),
    onSuccess: () => {
      setText("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      atBottomRef.current = true;
      latestQuery.refetch();
      invalidateConversations();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const noteMutation = useMutation({
    mutationFn: (noteText: string) => whatsappService.addNote(phone, noteText),
    onSuccess: (res) => {
      toast.success(res.msg);
      setNoteOpen(false);
      latestQuery.refetch();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const tagsMutation = useMutation({
    mutationFn: (tags: string[]) => whatsappService.setTags(phone, tags),
    onSuccess: (res) => {
      toast.success(res.msg);
      setTagsOpen(false);
      setLocalPatch((prev) => ({ ...prev, tags: res.data.tags }));
      invalidateConversations();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const takeoverMutation = useMutation({
    mutationFn: () => whatsappService.takeover(phone),
    onSuccess: (res) => {
      toast.success(res.msg);
      // The endpoint only returns human_mode — it doesn't echo who was
      // assigned — but per the spec it always assigns the calling staff
      // member, so we already know who that is.
      setLocalPatch((prev) => ({
        ...prev,
        human_mode: res.data.human_mode,
        assigned_to: user ? { user_id: user.id, name: user.displayName } : prev.assigned_to,
      }));
      invalidateConversations();
      latestQuery.refetch();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const releaseMutation = useMutation({
    mutationFn: () => whatsappService.release(phone),
    onSuccess: (res) => {
      toast.success(res.msg);
      setLocalPatch((prev) => ({ ...prev, human_mode: res.data.human_mode, assigned_to: null }));
      invalidateConversations();
      latestQuery.refetch();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const retryMutation = useMutation({
    mutationFn: (messageId: string) => whatsappService.retryMessage(phone, messageId),
    onMutate: (messageId) => setRetryingId(messageId),
    onSuccess: (res) => {
      toast.success(res.msg);
      latestQuery.refetch();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
    onSettled: () => setRetryingId(null),
  });

  const windowOpen = isServiceWindowOpen(messages);
  const humanMode = localPatch.human_mode ?? conversation.human_mode;
  const tags = localPatch.tags ?? conversation.tags;
  const assignedTo = "assigned_to" in localPatch ? localPatch.assigned_to : conversation.assigned_to;

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !file) return;
    if (file) {
      sendMutation.mutate({ file, caption: trimmed || undefined });
    } else {
      sendMutation.mutate({ text: trimmed });
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await whatsappService.exportConversation(phone);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `whatsapp_${phone.replace(/[^0-9]/g, "")}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed", "Could not download this conversation's transcript.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {onBack && (
            <Button size="icon" variant="ghost" className="shrink-0 md:hidden" onClick={onBack}>
              <X className="h-4 w-4" />
            </Button>
          )}
          <Avatar>
            <AvatarFallback>{initials(conversation.patient_name, conversation.phone)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{conversation.patient_name ?? conversation.phone}</p>
            <p className="truncate text-xs text-muted-foreground">{conversation.phone}</p>
          </div>
          <Badge variant={humanMode ? "warning" : "secondary"} className="shrink-0 gap-1">
            {humanMode ? <UserCheck className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
            {humanMode ? (assignedTo?.name ?? "Human") : "Bot"}
          </Badge>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Can module="whatsapp_inbox" action="reply">
            {humanMode ? (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={releaseMutation.isPending}
                onClick={() => releaseMutation.mutate()}
              >
                {releaseMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UserX className="h-3.5 w-3.5" />
                )}
                Release to Bot
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={takeoverMutation.isPending}
                onClick={() => takeoverMutation.mutate()}
              >
                {takeoverMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UserCheck className="h-3.5 w-3.5" />
                )}
                Take Over
              </Button>
            )}
          </Can>
          <Button size="icon" variant="ghost" title="Search messages" onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4" />
          </Button>
          <Can module="whatsapp_inbox" action="reply">
            <Button size="icon" variant="ghost" title="Tags" onClick={() => setTagsOpen(true)}>
              <Tag className="h-4 w-4" />
            </Button>
          </Can>
          <Button size="icon" variant="ghost" title="Audit log" onClick={() => setAuditOpen(true)}>
            <History className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" title="Export transcript" disabled={exporting} onClick={handleExport}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
        }}
        className="flex-1 space-y-1.5 overflow-y-auto bg-muted/30 px-4 py-3"
      >
        {hasMore && (
          <div className="pb-2 text-center">
            <Button size="sm" variant="outline" disabled={loadOlderMutation.isPending} onClick={() => loadOlderMutation.mutate()}>
              {loadOlderMutation.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Load older messages
            </Button>
          </div>
        )}

        {latestQuery.isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onRetry={canReply ? (id) => retryMutation.mutate(id) : undefined}
            retrying={retryingId === message.id}
          />
        ))}
      </div>

      <div className="border-t border-border p-3">
        {!windowOpen && canReply && (
          <p className="mb-2 rounded-md bg-amber-500/10 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-400">
            The 24-hour customer service window is closed. Free-form messages can only be sent within 24 hours of the
            patient&apos;s last message — you can still add an internal note.
          </p>
        )}

        <div className="flex items-end gap-2">
          <Can module="whatsapp_inbox" action="reply">
            <Button size="icon" variant="outline" title="Add internal note" onClick={() => setNoteOpen(true)}>
              <StickyNote className="h-4 w-4" />
            </Button>
          </Can>

          <Can
            module="whatsapp_inbox"
            action="reply"
            fallback={<div className="flex-1 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">You don&apos;t have permission to reply.</div>}
          >
            <>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                disabled={!windowOpen || sendMutation.isPending}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <Button
                size="icon"
                variant="outline"
                title="Attach file"
                disabled={!windowOpen || sendMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>

              <div className="flex-1">
                {file && (
                  <div className="mb-1 flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1 text-xs">
                    <span className="truncate">{file.name}</span>
                    <button type="button" onClick={() => setFile(null)} className="ml-auto shrink-0" aria-label="Remove attachment">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <Textarea
                  rows={1}
                  className="max-h-32 min-h-[38px] resize-none py-2"
                  placeholder={windowOpen ? "Type a message…" : "24-hour window closed"}
                  value={text}
                  disabled={!windowOpen || sendMutation.isPending}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
              </div>

              <Button
                size="icon"
                disabled={!windowOpen || sendMutation.isPending || (!text.trim() && !file)}
                onClick={handleSend}
              >
                {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </>
          </Can>
        </div>
      </div>

      <NoteDialog
        open={noteOpen}
        onOpenChange={setNoteOpen}
        isSubmitting={noteMutation.isPending}
        onSubmit={(t) => noteMutation.mutate(t)}
      />
      <TagsDialog
        open={tagsOpen}
        onOpenChange={setTagsOpen}
        initialTags={tags}
        isSubmitting={tagsMutation.isPending}
        onSubmit={(tags) => tagsMutation.mutate(tags)}
      />
      <AuditLogDialog open={auditOpen} onOpenChange={setAuditOpen} phone={phone} />
      <MessageSearchDialog open={searchOpen} onOpenChange={setSearchOpen} phone={phone} />
    </div>
  );
}
