"use client";

import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AlarmClock, ArrowLeft, Ban, Bot, Check, ChevronDown, Download, EllipsisVertical, Eye, History, Info, Loader2,
  MailOpen, Search, ShieldAlert, Tag, UserRound,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { toast } from "@/src/lib/toast";
import { cn } from "@/src/lib/utils";
import type { NormalizedApiError } from "@/src/types/api";
import { avatarColor, initials } from "@/src/features/appointments/AppointmentRow";
import { AuditLogDialog } from "@/src/features/whatsapp/AuditLogDialog";
import { TagsDialog } from "@/src/features/whatsapp/TagsDialog";
import { Composer, retryRef } from "./Composer";
import {
  clockTime, dayLabel, displayName, formatPhone, inboxService, istDayStart,
  type InboxAction, type InboxHeader, type InboxMessage,
} from "./inbox";
import { InboxErrorState } from "./InboxErrorState";
import { useInbox } from "./InboxProvider";
import { MessageBubble } from "./MessageBubble";

const HOUR = 3_600_000;

function snoozePresets(now: number): { label: string; until: number }[] {
  const today = istDayStart(now);
  const tonight = today + 18 * HOUR;
  const tomorrow10 = today + 24 * HOUR + 10 * HOUR;
  return [
    { label: "1 hour", until: now + HOUR },
    ...(tonight > now + 10 * 60_000 ? [{ label: "Tonight, 6 PM", until: tonight }] : []),
    { label: "Tomorrow, 10 AM", until: tomorrow10 },
  ];
}

export function ChatPanel({ onBack, onShowPanel, panelOpen }: { onBack: () => void; onShowPanel: () => void; panelOpen: boolean }) {
  const { state, retryOpen } = useInbox();
  const open = state.open;
  if (state.openError) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center border-b p-2 lg:hidden">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to conversations"><ArrowLeft className="h-5 w-5" /></Button>
        </div>
        <InboxErrorState title="Couldn't load this chat" detail={state.openError} onRetry={retryOpen} testId="chat-error" />
      </div>
    );
  }
  if (state.openLoading || !open) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b p-4"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-48" /></div>
        <div className="flex-1 space-y-3 bg-[#EFEAE2] p-6 dark:bg-background">
          {[0, 1, 2].map((i) => <Skeleton key={i} className={cn("h-12 w-2/3", i % 2 && "ml-auto")} />)}
        </div>
      </div>
    );
  }
  return <OpenChat key={open.conversation.id} onBack={onBack} onShowPanel={onShowPanel} panelOpen={panelOpen} />;
}

function OpenChat({ onBack, onShowPanel, panelOpen }: { onBack: () => void; onShowPanel: () => void; panelOpen: boolean }) {
  const { state, putHeader, putContext, putMessage, syncNow } = useInbox();
  const open = state.open!;
  const h = open.conversation;
  const me = state.me;
  const canReply = Boolean(me?.can_reply);
  const [busy, setBusy] = useState<string | null>(null);

  const act = async (action: InboxAction, success?: string) => {
    setBusy(action.type);
    try {
      const res = await inboxService.action(h.id, action);
      putHeader(res.data.conversation);
      if (res.data.context) putContext(res.data.context);
      if (res.data.message) putMessage(res.data.message);
      if (success) toast.success(success);
      syncNow(); // picks up the system-event chip right away
      return res.data;
    } catch (err) {
      const e = err as NormalizedApiError;
      toast.error(e.error || "Couldn't do that", e.msg);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-card" data-testid="chat-panel">
      <ChatHeader h={h} busy={busy} act={act} onBack={onBack} onShowPanel={onShowPanel} panelOpen={panelOpen} canReply={canReply} />
      <ModeBanner h={h} busy={busy} act={act} canReply={canReply} presence={open.presence} meId={me?.id} />
      {h.opted_out && (
        <div className="flex items-center gap-2 border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200" data-testid="optout-banner">
          <ShieldAlert className="h-4 w-4" />Patient sent STOP - opted out. No templates or broadcasts; replies only while they keep writing to us.
        </div>
      )}
      {h.blocked && (
        <div className="flex items-center gap-2 border-b border-zinc-300 bg-zinc-100 px-4 py-2 text-sm text-zinc-700 dark:border-border dark:bg-muted dark:text-zinc-300">
          <Ban className="h-4 w-4" />This number is blocked - the bot is silent and nothing can be sent.
        </div>
      )}
      <MessageList />
      <Composer header={h} context={open.context} ai={open.ai} canReply={canReply} />
    </div>
  );
}

function ChatHeader({
  h, busy, act, onBack, onShowPanel, panelOpen, canReply,
}: {
  h: InboxHeader;
  busy: string | null;
  act: (a: InboxAction, success?: string) => Promise<unknown>;
  onBack: () => void;
  onShowPanel: () => void;
  panelOpen: boolean;
  canReply: boolean;
}) {
  const { state } = useInbox();
  const [customOpen, setCustomOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const name = displayName(h);
  const assignee = h.assignee;
  const canAssignOthers = state.me?.can_manage || !assignee || assignee.user_id === state.me?.id;

  const exportChat = async () => {
    try {
      const blob = await inboxService.exportChat(h.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `whatsapp_${h.id.replace(/\D/g, "")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Export failed", (err as NormalizedApiError).msg);
    }
  };

  return (
    <div className="flex items-center gap-2 border-b border-[#E3E9E5] px-3 py-2.5 dark:border-border sm:gap-3 sm:px-4">
      <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={onBack} aria-label="Back to conversations">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold", h.name || h.profile_name ? avatarColor(h.id) : "bg-muted text-muted-foreground")}>
        {h.name || h.profile_name ? initials(h.name || h.profile_name || "") : <UserRound className="h-5 w-5" />}
      </div>
      <div className="min-w-[120px] flex-1">
        <p className="truncate font-semibold text-[#17261F] dark:text-foreground" data-testid="chat-name">{name}</p>
        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-[#25D366]" />WhatsApp · {formatPhone(h.id)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden gap-1.5 sm:flex" disabled={!canReply} data-testid="assignee-button">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1F7A4A] text-[10px] font-bold text-white">
                {assignee ? initials(assignee.name ?? "") : "?"}
              </span>
              <span className="max-w-[96px] truncate">{assignee?.name ?? "Unassigned"}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Assign to</DropdownMenuLabel>
            {state.users.map((u) => (
              <DropdownMenuItem key={u.id} disabled={!canAssignOthers && u.id !== state.me?.id} onSelect={() => act({ type: "assign", user_id: u.id })}>
                {assignee?.user_id === u.id && <Check className="mr-1 h-4 w-4" />}{u.name}
                {u.id === state.me?.id && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}
              </DropdownMenuItem>
            ))}
            {assignee && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={!canAssignOthers} onSelect={() => act({ type: "assign", user_id: null })}>Unassign</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5" disabled={!canReply} aria-label="Snooze" title="Snooze">
              <AlarmClock className="h-4 w-4 text-red-500" /><span className="hidden min-[1760px]:inline">{h.snooze_until && h.snooze_until > state.now ? `Snoozed · ${clockTime(h.snooze_until)}` : "Snooze"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Snooze until</DropdownMenuLabel>
            {snoozePresets(state.now).map((p) => (
              <DropdownMenuItem key={p.label} onSelect={() => act({ type: "snooze", until: p.until }, `Snoozed until ${p.label.toLowerCase()}`)}>{p.label}</DropdownMenuItem>
            ))}
            <DropdownMenuItem onSelect={() => setCustomOpen(true)}>Custom…</DropdownMenuItem>
            {h.snooze_until && h.snooze_until > state.now && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => act({ type: "unsnooze" })}>Remove snooze</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {h.status === "done" ? (
          <Button variant="outline" size="sm" disabled={!canReply || busy === "reopen"} onClick={() => act({ type: "reopen" })}>Reopen</Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-1.5 font-semibold" disabled={!canReply || busy === "done"} onClick={() => act({ type: "done" }, "Marked as done")} aria-label="Mark as done" title="Mark as done">
            {busy === "done" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            <span className="hidden min-[1680px]:inline">Mark as done</span>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9" aria-label="More actions"><EllipsisVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuItem className="sm:hidden" disabled={!canReply} onSelect={() => act({ type: "assign", user_id: state.me?.id ?? null })}>
              <UserRound className="mr-2 h-4 w-4" />Assign to me
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTagsOpen(true)} disabled={!canReply}><Tag className="mr-2 h-4 w-4" />Tags{h.tags.length ? ` · ${h.tags.join(", ")}` : ""}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSearchOpen(true)}><Search className="mr-2 h-4 w-4" />Search in chat</DropdownMenuItem>
            <DropdownMenuItem onSelect={exportChat}><Download className="mr-2 h-4 w-4" />Export chat</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => act({ type: "mark_unread" }, "Marked as unread")}><MailOpen className="mr-2 h-4 w-4" />Mark as unread</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setLogOpen(true)}><History className="mr-2 h-4 w-4" />Activity log</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              WhatsApp status: {h.opted_out ? "opted out (STOP)" : "subscribed"}
            </DropdownMenuLabel>
            <DropdownMenuItem disabled={!canReply} className={h.blocked ? "" : "text-red-600"}
              onSelect={() => act({ type: h.blocked ? "unblock" : "block" }, h.blocked ? "Number unblocked" : "Number blocked")}>
              <Ban className="mr-2 h-4 w-4" />{h.blocked ? "Unblock number" : "Block number"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="icon" className={cn("h-9 w-9", panelOpen && "xl:hidden")} onClick={onShowPanel} aria-label="Patient details">
          <Info className="h-4 w-4" />
        </Button>
      </div>

      <CustomSnoozeDialog open={customOpen} onOpenChange={setCustomOpen} onPick={(until) => act({ type: "snooze", until }, "Snoozed")} />
      <TagsDialog open={tagsOpen} onOpenChange={setTagsOpen} initialTags={h.tags} isSubmitting={busy === "set_tags"}
        onSubmit={async (tags) => { await act({ type: "set_tags", tags }, "Tags saved"); setTagsOpen(false); }} />
      <ChatSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <AuditLogDialog open={logOpen} onOpenChange={setLogOpen} phone={h.id} />
    </div>
  );
}

function ModeBanner({
  h, busy, act, canReply, presence, meId,
}: {
  h: InboxHeader;
  busy: string | null;
  act: (a: InboxAction, success?: string) => Promise<unknown>;
  canReply: boolean;
  presence: { id: string; name: string }[];
  meId?: string;
}) {
  const firstName = (h.name || h.profile_name || "this patient").split(" ")[0];
  const human = h.mode === "human";
  const mine = !h.assignee || h.assignee.user_id === meId;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-2 text-sm",
        human ? "border-sky-100 bg-sky-50 text-sky-950 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-100"
          : "border-emerald-100 bg-emerald-50 text-emerald-950 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100"
      )}
      data-testid="mode-banner"
      data-mode={h.mode}
    >
      {human ? (
        <p className="flex-1">
          <UserRound className="mr-1.5 inline h-4 w-4" />
          <strong>{mine ? "You are chatting." : `${h.assignee?.name} is chatting.`}</strong> Bot is paused for {firstName}.
        </p>
      ) : (
        <p className="flex-1"><Bot className="mr-1.5 inline h-4 w-4" /><strong>Bot is replying</strong> to this patient.</p>
      )}
      {presence.length > 0 && (
        <span className="flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-xs dark:bg-white/10" data-testid="presence">
          <Eye className="h-3.5 w-3.5" />
          {presence.map((p) => p.name).join(", ")} {presence.length === 1 ? "is" : "are"} also viewing
        </span>
      )}
      {canReply && (
        <Button
          size="sm"
          variant="outline"
          className="bg-white font-semibold dark:bg-transparent"
          disabled={busy === "hand_back" || busy === "take_over"}
          onClick={() => act(human ? { type: "hand_back" } : { type: "take_over" }, human ? "Handed back to the bot" : "Bot paused - you're replying")}
        >
          {human ? "Hand back to bot" : "Reply myself"}
        </Button>
      )}
    </div>
  );
}

function MessageList() {
  const { state, loadOlder } = useInbox();
  const open = state.open!;
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const prevHeight = useRef(0);
  const lastCount = useRef(0);

  const items = useMemo(() => {
    const out: { key: string; divider?: string; m?: InboxMessage }[] = [];
    let lastDay = -1;
    for (const m of open.messages) {
      const day = istDayStart(m.at);
      if (day !== lastDay) {
        out.push({ key: `d-${day}`, divider: dayLabel(m.at, state.now) });
        lastDay = day;
      }
      out.push({ key: m.client_id || m.id, m });
    }
    return out;
  }, [open.messages, state.now]);

  // Stick to the bottom for new messages; keep position when older ones load above.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (lastCount.current === 0 || atBottom.current) el.scrollTop = el.scrollHeight;
    else if (prevHeight.current && el.scrollHeight > prevHeight.current && el.scrollTop < 50) {
      el.scrollTop += el.scrollHeight - prevHeight.current;
    }
    prevHeight.current = el.scrollHeight;
    lastCount.current = open.messages.length;
  }, [open.messages.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      if (el.scrollTop < 60 && open.has_more && !open.loadingOlder) {
        prevHeight.current = el.scrollHeight;
        void loadOlder();
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [open.has_more, open.loadingOlder, loadOlder]);

  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-y-auto bg-[#EFEAE2] px-3 py-3 dark:bg-[#0f1a15] sm:px-6"
      data-testid="message-list"
      aria-live="polite"
    >
      {open.has_more && (
        <div className="flex justify-center py-2">
          <Button size="sm" variant="ghost" onClick={() => loadOlder()} disabled={open.loadingOlder} data-testid="load-older">
            {open.loadingOlder ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load earlier messages"}
          </Button>
        </div>
      )}
      {!open.messages.length && <p className="py-10 text-center text-sm text-muted-foreground">No messages yet.</p>}
      {items.map((it) => (
        <Fragment key={it.key}>
          {it.divider ? (
            <div className="my-3 flex justify-center" data-testid="date-divider">
              <span className="rounded-md bg-white px-3 py-1 text-xs text-muted-foreground shadow-sm dark:bg-card">{it.divider}</span>
            </div>
          ) : (
            <MessageBubble m={it.m!} onRetry={(m) => retryRef.current?.(m)} />
          )}
        </Fragment>
      ))}
    </div>
  );
}

function CustomSnoozeDialog({ open, onOpenChange, onPick }: { open: boolean; onOpenChange: (o: boolean) => void; onPick: (until: number) => void }) {
  const [value, setValue] = useState("");
  const [valid, setValid] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Snooze until…</DialogTitle>
          <DialogDescription>The chat returns to its list by itself at this time.</DialogDescription>
        </DialogHeader>
        <Input type="datetime-local" value={value} aria-label="Snooze until"
          onChange={(e) => { setValue(e.target.value); setValid(new Date(e.target.value).getTime() > Date.now()); }} />
        <div className="flex justify-end">
          <Button disabled={!value || !valid} onClick={() => { onPick(new Date(value).getTime()); onOpenChange(false); }}>
            Snooze
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChatSearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { state } = useInbox();
  const [q, setQ] = useState("");
  const hits = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return (state.open?.messages ?? []).filter((m) => (m.text ?? m.template?.body ?? "").toLowerCase().includes(term)).slice(-30);
  }, [q, state.open?.messages]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Search in chat</DialogTitle>
          <DialogDescription>Searches the messages loaded in this chat. Scroll up to load older ones.</DialogDescription>
        </DialogHeader>
        <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search messages" aria-label="Search messages" />
        <ul className="max-h-[50vh] space-y-2 overflow-y-auto">
          {hits.map((m) => (
            <li key={m.id} className="rounded-md border p-2 text-sm">
              <p className="text-xs text-muted-foreground">{m.sender.name ?? (m.dir === "inbound" ? "Patient" : "Bot")} · {dayLabel(m.at, state.now)} {clockTime(m.at)}</p>
              <p className="line-clamp-3 whitespace-pre-wrap">{m.text ?? m.template?.body}</p>
            </li>
          ))}
          {q.trim() && !hits.length && <li className="text-sm text-muted-foreground">No matches.</li>}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
