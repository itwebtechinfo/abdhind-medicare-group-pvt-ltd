"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Lock, NotebookPen, Paperclip, Plus, SendHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { toast } from "@/src/lib/toast";
import { cn } from "@/src/lib/utils";
import type { NormalizedApiError } from "@/src/types/api";
import { doctorService } from "@/src/features/doctors/doctor";
import type { ApiTemplate } from "@/src/features/whatsapp/whatsapp";
import {
  errorCode,
  inboxService,
  newClientId,
  windowLeft,
  type InboxHeader,
  type InboxMessage,
  type InboxUser,
  type PatientContext,
  type SavedReply,
} from "./inbox";
import { useInbox } from "./InboxProvider";
import { SAVED_REPLIES_KEY, SavedRepliesDialog } from "./SavedRepliesDialog";
import { TemplatePickerDialog } from "./TemplatePickerDialog";

type Tab = "reply" | "note";
type Pending = { kind: "text"; text: string } | { kind: "media"; file: File; text?: string };

const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

const slotDayFmt = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
function slotTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

interface Props {
  header: InboxHeader;
  context: PatientContext | null;
  ai: { suggested_reply: string | null } | null;
  canReply: boolean;
}

export function Composer({ header, context, ai, canReply }: Props) {
  const { state, putMessage, syncNow } = useInbox();
  const me = state.me;
  const [tab, setTab] = useState<Tab>("reply");
  const [text, setText] = useState("");
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIds, setMentionIds] = useState<Record<string, string>>({}); // name -> user id
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateSending, setTemplateSending] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [editingSaved, setEditingSaved] = useState<SavedReply | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef<Record<string, Pending>>({});

  // A new chat starts with an empty composer on the Reply tab.
  useEffect(() => {
    setText("");
    setTab("reply");
    setMentionIds({});
  }, [header.id]);

  const { data: saved = [] } = useQuery({
    queryKey: SAVED_REPLIES_KEY,
    queryFn: async () => (await inboxService.savedReplies()).data.items,
    staleTime: 5 * 60_000,
  });
  const pinned = saved.filter((r) => r.pinned);

  const window = header.window;
  const left = windowLeft(window, state.now);
  const replyBlocked = tab === "reply" && (!left || header.blocked);
  const note = tab === "note";

  const insert = (value: string) => {
    setText((cur) => (cur ? `${cur}\n${value}` : value));
    requestAnimationFrame(() => textRef.current?.focus());
  };

  // ---------- sending ----------
  const local = (clientId: string, p: Pending): InboxMessage => ({
    id: `local-${clientId}`,
    client_id: clientId,
    dir: "outbound",
    type: p.kind === "text" ? "text" : p.file.type === "application/pdf" ? "document" : "image",
    at: Date.now(),
    status: "sending",
    sender: { role: "staff", name: me?.name ?? null, id: me?.id ?? null },
    note: false,
    text: p.kind === "text" ? p.text : (p.text ?? null),
    media: p.kind === "media"
      ? { mime: p.file.type, size: p.file.size, filename: p.file.name, caption: p.text ?? null, voice: false, duration: null, peaks: null,
          status: "stored", transcode: null, url: URL.createObjectURL(p.file), download_url: null }
      : undefined,
    local: true,
  });

  const deliver = async (clientId: string) => {
    const p = pendingRef.current[clientId];
    if (!p) return;
    try {
      const res = await inboxService.send(header.id, p.kind === "text"
        ? { client_id: clientId, kind: "text", text: p.text }
        : { client_id: clientId, kind: "media", file: p.file, text: p.text });
      putMessage(res.data.message);
      if (res.data.message.status !== "failed") delete pendingRef.current[clientId];
      syncNow();
    } catch (err) {
      const e = err as NormalizedApiError;
      const code = errorCode(e);
      putMessage({ ...local(clientId, p), status: "failed", error: e.msg, local: true });
      if (code === "window_closed") toast.error("Reply window closed", "Send an approved template instead.");
      else toast.error(e.error || "Not sent", e.msg);
    }
  };

  const sendPending = (p: Pending) => {
    const clientId = newClientId();
    pendingRef.current[clientId] = p;
    putMessage(local(clientId, p));
    void deliver(clientId);
  };

  const retry = (m: InboxMessage) => {
    if (!m.client_id) return;
    // Same client_id: the server resends the stored message, never a second copy.
    pendingRef.current[m.client_id] ??= { kind: "text", text: m.text ?? "" };
    putMessage({ ...m, status: "sending" });
    void deliver(m.client_id);
  };
  retryRef.current = retry;

  const sendNote = async (value: string) => {
    const clientId = newClientId();
    const mentions = Object.entries(mentionIds).filter(([name]) => value.includes(`@${name}`)).map(([, id]) => id);
    putMessage({
      id: `local-${clientId}`, client_id: clientId, dir: "internal", type: "text", at: Date.now(), status: "internal",
      sender: { role: "staff", name: me?.name ?? null, id: me?.id ?? null }, note: true, text: value,
      mentions: Object.entries(mentionIds).filter(([name]) => value.includes(`@${name}`)).map(([name, id]) => ({ user_id: id, name })),
      local: true,
    });
    try {
      const res = await inboxService.note(header.id, value, mentions, clientId);
      putMessage(res.data.message);
    } catch (err) {
      const e = err as NormalizedApiError;
      toast.error("Note not saved", e.msg);
    }
  };

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    if (note) {
      void sendNote(value);
      setMentionIds({});
    } else {
      if (replyBlocked) return;
      sendPending({ kind: "text", text: value });
    }
    setText("");
  };

  const sendTemplate = async (t: ApiTemplate, variables: string[]) => {
    setTemplateSending(true);
    try {
      const res = await inboxService.send(header.id, {
        client_id: newClientId(), kind: "template", template_name: t.name, language: t.language, variables,
      });
      putMessage(res.data.message);
      setTemplateOpen(false);
      syncNow();
    } catch (err) {
      const e = err as NormalizedApiError;
      toast.error(e.error || "Template not sent", e.msg);
    } finally {
      setTemplateSending(false);
    }
  };

  // ---------- @mentions (internal notes only) ----------
  const mentionMatches = useMemo<InboxUser[]>(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return state.users.filter((u) => u.id !== me?.id && u.name.toLowerCase().includes(q)).slice(0, 6);
  }, [mentionQuery, state.users, me?.id]);

  const onChange = (value: string) => {
    setText(value);
    if (!note) return setMentionQuery(null);
    const caret = textRef.current?.selectionStart ?? value.length;
    const match = /@([\w .]{0,30})$/.exec(value.slice(0, caret));
    setMentionQuery(match ? match[1] : null);
  };

  const pickMention = (u: InboxUser) => {
    const caret = textRef.current?.selectionStart ?? text.length;
    const before = text.slice(0, caret).replace(/@([\w .]{0,30})$/, `@${u.name} `);
    setText(before + text.slice(caret));
    setMentionIds((m) => ({ ...m, [u.name]: u.id }));
    setMentionQuery(null);
    requestAnimationFrame(() => textRef.current?.focus());
  };

  // ---------- Slots quick reply ----------
  const slotsText = async () => {
    try {
      const doctors = (await doctorService.list()).data.doctors.filter((d) => d.active);
      if (!doctors.length) return toast.error("No active doctor", "Add a doctor first.");
      // The patient's own doctor first, then whoever has open slots.
      const ordered = [...doctors].sort((a, b) => Number(b.id === context?.patient?.last_doctor_id) - Number(a.id === context?.patient?.last_doctor_id));
      let doctor = ordered[0];
      let slots: Awaited<ReturnType<typeof doctorService.listSlots>>["data"]["slots"] = [];
      for (const d of ordered.slice(0, 6)) {
        slots = (await doctorService.listSlots(d.id)).data.slots.filter((s) => !s.is_booked);
        doctor = d;
        if (slots.length) break;
      }
      if (!slots.length) return toast.info("No open slots", "No doctor has open slots right now.");
      const byDay = new Map<string, string[]>();
      for (const s of slots) {
        if (byDay.size >= 2 && !byDay.has(s.date)) break;
        const list = byDay.get(s.date) ?? [];
        if (list.length < 5) list.push(slotTime(s.start_time));
        byDay.set(s.date, list);
      }
      const lines = [...byDay].map(([d, times]) => `• ${slotDayFmt.format(new Date(`${d}T00:00:00Z`))}: ${times.join(", ")}`);
      insert(`Available slots with ${doctor.full_name}:\n${lines.join("\n")}`);
    } catch (err) {
      toast.error("Couldn't load slots", (err as NormalizedApiError).msg);
    }
  };

  if (!canReply) {
    return <p className="border-t border-[#E3E9E5] p-4 text-center text-sm text-muted-foreground dark:border-border">You can view this chat but not reply.</p>;
  }

  return (
    <div className={cn("border-t border-[#E3E9E5] px-3 pb-3 pt-2 dark:border-border sm:px-4", note && "bg-[#FFFBEA] dark:bg-amber-500/5")} data-testid="composer" data-mode={tab}>
      <div className="mb-2 flex items-center gap-2" role="tablist" aria-label="Composer mode">
        <button role="tab" type="button" aria-selected={!note} onClick={() => setTab("reply")}
          className={cn("rounded-md px-3 py-1.5 text-sm font-semibold", !note ? "bg-[#17261F] text-white dark:bg-foreground dark:text-background" : "text-muted-foreground hover:bg-muted")}>
          Reply to patient
        </button>
        <button role="tab" type="button" aria-selected={note} onClick={() => setTab("note")}
          className={cn("flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm", note ? "border-amber-400 bg-amber-100 font-semibold text-amber-900 dark:bg-amber-500/20 dark:text-amber-200" : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-transparent dark:text-amber-300")}>
          <NotebookPen className="h-3.5 w-3.5" />Internal note
        </button>
      </div>

      {ai?.suggested_reply && !note && (
        <div className="mb-2 flex items-start gap-3 rounded-lg border border-violet-200 bg-violet-50 p-2.5 text-sm dark:border-violet-500/30 dark:bg-violet-500/10" data-testid="ai-suggestion">
          <span className="flex shrink-0 items-center gap-1 font-semibold text-violet-700 dark:text-violet-300"><Sparkles className="h-4 w-4" />Suggested reply</span>
          <p className="flex-1">{ai.suggested_reply}</p>
          <Button size="sm" onClick={() => sendPending({ kind: "text", text: ai.suggested_reply! })}>Use</Button>
          <Button size="sm" variant="outline" onClick={() => setText(ai.suggested_reply!)}>Edit</Button>
        </div>
      )}

      {!note && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {pinned.map((r) => (
            <button key={r.id} type="button" disabled={replyBlocked}
              onClick={() => (r.needs_setup ? (setEditingSaved(r), setSavedOpen(true)) : insert(r.text))}
              className={cn("rounded-full border border-[#E3E9E5] px-3 py-1 text-sm hover:bg-muted disabled:opacity-50 dark:border-border", r.needs_setup && "border-dashed text-muted-foreground")}
              title={r.needs_setup ? `Set up the ${r.title} reply` : r.text}>
              {r.icon} {r.title}{r.needs_setup ? " · set up" : ""}
            </button>
          ))}
          <button type="button" disabled={replyBlocked} onClick={slotsText} className="flex items-center gap-1 rounded-full border border-[#E3E9E5] px-3 py-1 text-sm hover:bg-muted disabled:opacity-50 dark:border-border">
            <CalendarDays className="h-3.5 w-3.5 text-red-500" /> Slots
          </button>
          <button type="button" onClick={() => { setEditingSaved(null); setSavedOpen(true); }} className="flex items-center gap-1 rounded-full border border-[#E3E9E5] px-3 py-1 text-sm hover:bg-muted dark:border-border">
            <Plus className="h-3.5 w-3.5" /> Saved reply
          </button>
          <span
            className={cn(
              "ml-auto flex items-center gap-1.5 text-sm font-semibold",
              !left ? "text-red-600 dark:text-red-400" : left.urgent ? "text-amber-700 dark:text-amber-400" : "text-[#1F7A4A] dark:text-emerald-400"
            )}
            data-testid="reply-window"
            data-urgent={left?.urgent ? "true" : "false"}
          >
            <span className={cn("h-2.5 w-2.5 rounded-full", !left ? "bg-red-500" : left.urgent ? "bg-amber-500" : "bg-emerald-500")} />
            {left ? `Reply window ${left.label}` : "Reply window closed"}
          </span>
        </div>
      )}

      {replyBlocked ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-[#E3E9E5] p-3 text-center text-sm text-muted-foreground dark:border-border sm:flex-row sm:justify-between sm:text-left">
          <span className="flex items-center gap-2"><Lock className="h-4 w-4" />
            {header.blocked ? "This number is blocked." : "24-hour window closed - free text can't be sent. Only an approved template can reach the patient."}
          </span>
          {!header.blocked && (
            <Button size="sm" className="bg-[#1F7A4A] text-white hover:bg-[#1F7A4A]/90" disabled={header.opted_out} onClick={() => setTemplateOpen(true)}
              title={header.opted_out ? "The patient opted out (STOP)" : undefined}>
              Send a template
            </Button>
          )}
        </div>
      ) : (
        <div className="relative flex items-end gap-2">
          {!note && (
            <>
              <Button type="button" variant="outline" className="h-11 shrink-0 font-semibold" onClick={() => setTemplateOpen(true)} disabled={header.opted_out}
                title={header.opted_out ? "The patient opted out (STOP)" : "Send an approved template"}>
                Template
              </Button>
              <Button type="button" variant="outline" size="icon" className="h-11 w-11 shrink-0" aria-label="Attach image or PDF" onClick={() => fileRef.current?.click()}>
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                data-testid="attach-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  sendPending({ kind: "media", file, text: text.trim() || undefined });
                  setText("");
                }}
              />
            </>
          )}
          <textarea
            ref={textRef}
            value={text}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (mentionMatches.length && e.key === "Enter") {
                e.preventDefault();
                pickMention(mentionMatches[0]);
                return;
              }
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder={note ? "Note for staff only - type @ to mention a colleague" : `Type a reply to ${(header.name || header.profile_name || "the patient").split(" ")[0]}…`}
            aria-label={note ? "Internal note" : "Reply"}
            className={cn(
              "max-h-40 min-h-11 flex-1 resize-none rounded-lg border px-3 py-2.5 text-sm outline-none focus-visible:ring-2",
              note
                ? "border-amber-300 bg-[#FFF8DB] placeholder:text-amber-700/60 focus-visible:ring-amber-400 dark:border-amber-500/40 dark:bg-amber-500/10"
                : "border-[#E3E9E5] bg-background focus-visible:ring-[#1F7A4A]/40 dark:border-border"
            )}
          />
          {mentionMatches.length > 0 && (
            <ul className="absolute bottom-full left-0 z-10 mb-1 w-64 rounded-lg border bg-popover p-1 shadow-lg" role="listbox" aria-label="Mention">
              {mentionMatches.map((u) => (
                <li key={u.id}>
                  <button type="button" className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted" onClick={() => pickMention(u)}>
                    @{u.name} <span className="text-xs text-muted-foreground">{u.role.replace("_", " ")}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Button type="button" onClick={submit} disabled={!text.trim()} aria-label={note ? "Add note" : "Send"}
            className={cn("h-11 w-12 shrink-0", note ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-[#1F7A4A] text-white hover:bg-[#1F7A4A]/90 dark:bg-primary dark:text-primary-foreground")}>
            {note ? <NotebookPen className="h-5 w-5" /> : <SendHorizontal className="h-5 w-5" />}
          </Button>
        </div>
      )}

      <TemplatePickerDialog open={templateOpen} onOpenChange={setTemplateOpen} patientName={header.name || header.profile_name}
        sending={templateSending} onSend={sendTemplate} />
      <SavedRepliesDialog key={editingSaved?.id ?? "list"} open={savedOpen} onOpenChange={setSavedOpen} replies={saved}
        canManage={Boolean(state.me?.can_reply)} editing={editingSaved} onPick={insert} />
    </div>
  );
}

/** Lets the message list's Retry button reach the composer's send pipeline. */
export const retryRef: { current: ((m: InboxMessage) => void) | null } = { current: null };
