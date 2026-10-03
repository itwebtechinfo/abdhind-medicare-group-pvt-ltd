"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AlertCircle, Bot, Check, CheckCheck, Clock, Download, ExternalLink, FileText, MapPin, NotebookPen, RotateCw, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { clockTime, formatBytes, type InboxMessage } from "./inbox";
import { VoicePlayer } from "./VoicePlayer";

/** Bold (*x*), italic (_x_), strike (~x~) - WhatsApp's own formatting. */
function WaText({ text }: { text: string }) {
  const parts = text.split(/(\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~)/g);
  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.map((p, i) =>
        /^\*[^*]+\*$/.test(p) ? <strong key={i}>{p.slice(1, -1)}</strong>
        : /^_[^_]+_$/.test(p) ? <em key={i}>{p.slice(1, -1)}</em>
        : /^~[^~]+~$/.test(p) ? <s key={i}>{p.slice(1, -1)}</s>
        : <span key={i}>{p}</span>
      )}
    </span>
  );
}

function Ticks({ m, onRetry }: { m: InboxMessage; onRetry?: (m: InboxMessage) => void }) {
  if (m.dir !== "outbound") return null;
  if (m.status === "sending") return <span className="flex items-center gap-1" data-testid="status-sending"><Clock className="h-3 w-3" />Sending…</span>;
  if (m.status === "failed")
    return (
      <span className="flex items-center gap-1 text-red-600 dark:text-red-400" data-testid="status-failed">
        <AlertCircle className="h-3 w-3" />
        Failed
        {onRetry && m.sender.role === "staff" && (
          <button type="button" onClick={() => onRetry(m)} className="ml-1 flex items-center gap-0.5 font-semibold underline">
            <RotateCw className="h-3 w-3" />Retry
          </button>
        )}
      </span>
    );
  if (m.status === "read") return <CheckCheck className="h-3.5 w-3.5 text-sky-500" aria-label="Read" data-testid="status-read" />;
  if (m.status === "delivered") return <CheckCheck className="h-3.5 w-3.5" aria-label="Delivered" data-testid="status-delivered" />;
  return <Check className="h-3.5 w-3.5" aria-label="Sent" data-testid="status-sent" />;
}

export function SystemChip({ m }: { m: InboxMessage }) {
  return (
    <div className="my-1 flex justify-center" data-testid="system-event" data-event={m.event}>
      <span className="max-w-[85%] rounded-md bg-[#FFF5CC] px-3 py-1 text-center text-xs text-[#5C4A00] shadow-sm dark:bg-amber-500/15 dark:text-amber-200">
        {m.event === "moved_to_staff" ? "🤖 " : ""}
        {m.text} · {clockTime(m.at)}
      </span>
    </div>
  );
}

export function MessageBubble({ m, onRetry }: { m: InboxMessage; onRetry?: (m: InboxMessage) => void }) {
  if (m.dir === "system") return <SystemChip m={m} />;

  if (m.note) {
    return (
      <div className="my-1 flex justify-center" data-testid="internal-note">
        <div className="w-full max-w-[78%] rounded-lg border border-amber-300 bg-[#FFF8DB] px-3 py-2 text-sm text-[#3D3200] dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
          <p className="mb-0.5 flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <NotebookPen className="h-3.5 w-3.5" />
            Internal note · {m.sender.name ?? "Staff"} · only staff can see
          </p>
          <NoteText text={m.text ?? ""} mentions={m.mentions ?? []} />
          <p className="mt-1 text-right text-[11px] text-amber-700/70 dark:text-amber-300/60">
            {m.local ? "Saving…" : clockTime(m.at)}
          </p>
        </div>
      </div>
    );
  }

  const inbound = m.dir === "inbound";
  // Bot replies and automatic system messages (OTP, reminders) vs. a person.
  const isBot = !inbound && (m.sender.role === "bot" || m.sender.role === "system" || !m.sender.role);
  return (
    <div className={cn("my-1 flex", inbound ? "justify-start" : "justify-end")} data-testid="message" data-dir={m.dir} data-type={m.type}>
      <div
        className={cn(
          "max-w-[78%] rounded-lg px-3 py-2 text-sm shadow-sm",
          inbound
            ? "rounded-tl-none bg-white text-[#17261F] dark:bg-card dark:text-foreground"
            : "rounded-tr-none bg-[#DCF8C6] text-[#17261F] dark:bg-[#1F4D33] dark:text-emerald-50"
        )}
      >
        {!inbound && (
          <p className={cn("mb-0.5 flex items-center gap-1 text-xs font-semibold", isBot ? "text-[#1F7A4A]/80 dark:text-emerald-300/80" : "text-[#1F7A4A] dark:text-emerald-300")}>
            {isBot ? (<><Bot className="h-3.5 w-3.5" />{m.sender.name ?? "Bot"}</>) : m.sender.name ?? "Staff"}
          </p>
        )}
        {m.template && <TemplateBody m={m} />}
        {!m.template && <Body m={m} />}
        <div className="mt-1 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground dark:text-emerald-100/60">
          {m.type === "audio" && m.media?.voice ? "voice note ·" : null}
          <span>{clockTime(m.at)}</span>
          <Ticks m={m} onRetry={onRetry} />
        </div>
      </div>
    </div>
  );
}

function NoteText({ text, mentions }: { text: string; mentions: { name: string }[] }) {
  if (!mentions.length) return <WaText text={text} />;
  const names = mentions.map((x) => x.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(@(?:${names.join("|")}))`, "g"));
  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.map((p, i) => (p.startsWith("@") && names.some((n) => new RegExp(`^@${n}$`).test(p))
        ? <strong key={i} className="text-sky-700 dark:text-sky-300">{p}</strong>
        : <span key={i}>{p}</span>))}
    </span>
  );
}

function TemplateBody({ m }: { m: InboxMessage }) {
  const t = m.template!;
  return (
    <div data-testid="template-message">
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground dark:text-emerald-100/60">
        Template · {t.name}
      </p>
      {t.header && <p className="font-semibold">{t.header}</p>}
      {t.body ? <WaText text={t.body} /> : <span className="text-muted-foreground">Template message</span>}
      {t.footer && <p className="mt-1 text-xs text-muted-foreground">{t.footer}</p>}
      {t.buttons.length > 0 && <Chips labels={t.buttons} />}
    </div>
  );
}

function Chips({ labels }: { labels: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {labels.map((b, i) => (
        <span key={i} className="rounded-full border border-[#1F7A4A]/30 bg-white/70 px-2.5 py-0.5 text-xs font-medium text-[#1F7A4A] dark:border-emerald-300/30 dark:bg-white/5 dark:text-emerald-200">
          {b}
        </span>
      ))}
    </div>
  );
}

function Body({ m }: { m: InboxMessage }) {
  const media = m.media;
  if (m.type === "audio" && media) return <VoicePlayer id={m.id} media={media} outgoing={m.dir !== "inbound"} />;
  if ((m.type === "image" || m.type === "sticker") && media) {
    return (
      <div>
        <ImageWithLightbox media={media} />
        {media.caption && <p className="mt-1"><WaText text={media.caption} /></p>}
      </div>
    );
  }
  if ((m.type === "document" || m.type === "video") && media) return <DocumentCard media={media} type={m.type} />;
  if (m.type === "location" && m.location) {
    return (
      <a href={`https://maps.google.com/?q=${m.location.lat},${m.location.lng}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#1F7A4A] underline dark:text-emerald-300">
        <MapPin className="h-4 w-4" />{m.location.name ?? "Shared location"}
      </a>
    );
  }
  return (
    <div>
      {m.text ? <WaText text={m.text} /> : <span className="italic text-muted-foreground">Unsupported message</span>}
      {m.buttons && m.buttons.length > 0 && <Chips labels={m.buttons} />}
      {m.list_button && <Chips labels={[`☰ ${m.list_button}`]} />}
    </div>
  );
}

function ImageWithLightbox({ media }: { media: NonNullable<InboxMessage["media"]> }) {
  const [open, setOpen] = useState(false);
  if (!media.url) return <p className="text-sm text-muted-foreground">{media.status === "pending" ? "Photo is downloading…" : "📷 Photo unavailable"}</p>;
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button type="button" className="block overflow-hidden rounded-md" aria-label="Open photo" data-testid="image-thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media.url} alt={media.caption ?? "Photo"} loading="lazy" className="max-h-64 w-auto max-w-full object-cover" />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/85" />
        <DialogPrimitive.Content aria-describedby={undefined} className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none" data-testid="lightbox">
          <DialogPrimitive.Title className="sr-only">Photo</DialogPrimitive.Title>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media.url} alt={media.caption ?? "Photo"} className="max-h-full max-w-full rounded-md object-contain" />
          <div className="absolute right-4 top-4 flex gap-2">
            {media.download_url && (
              <a href={media.download_url} download className="rounded-full bg-white/15 p-2 text-white hover:bg-white/25" aria-label="Download photo">
                <Download className="h-5 w-5" />
              </a>
            )}
            <DialogPrimitive.Close className="rounded-full bg-white/15 p-2 text-white hover:bg-white/25" aria-label="Close">
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function DocumentCard({ media, type }: { media: NonNullable<InboxMessage["media"]>; type: string }) {
  const name = media.filename || (type === "video" ? "Video" : "Document");
  const isPdf = (media.mime ?? "").includes("pdf") || name.toLowerCase().endsWith(".pdf");
  return (
    <div className="flex w-[260px] max-w-full items-center gap-3 rounded-md bg-white/70 p-2 dark:bg-white/5" data-testid="document-card">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-xs font-bold", isPdf ? "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300" : "bg-muted text-muted-foreground")}>
        {isPdf ? "PDF" : <FileText className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{name}</p>
        <p className="text-xs text-muted-foreground">
          {media.status === "pending" ? "Downloading…" : [isPdf ? "PDF" : media.mime, formatBytes(media.size)].filter(Boolean).join(" · ")}
        </p>
      </div>
      {media.url && (
        <div className="flex shrink-0 gap-1">
          <a href={media.url} target="_blank" rel="noreferrer" aria-label={`Open ${name}`} className="rounded p-1.5 text-muted-foreground hover:bg-muted"><ExternalLink className="h-4 w-4" /></a>
          {media.download_url && <a href={media.download_url} download aria-label={`Download ${name}`} className="rounded p-1.5 text-muted-foreground hover:bg-muted"><Download className="h-4 w-4" /></a>}
        </div>
      )}
    </div>
  );
}
