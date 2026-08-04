"use client";

import {
  AlertCircle,
  Bot,
  Check,
  CheckCheck,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mic,
  RefreshCw,
  StickyNote,
  Video as VideoIcon,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { displayTimeOnly, type ApiMessage } from "./whatsapp";

const RETRYABLE_TYPES = new Set(["text", "template", "image", "audio", "video", "document"]);

function MediaPlaceholder({
  icon: Icon,
  label,
  mimeType,
}: {
  icon: typeof FileText;
  label: string;
  mimeType?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-dashed border-current/30 px-3 py-2 text-sm opacity-80">
      <Icon className="h-4 w-4 shrink-0" />
      <span>
        {label}
        {mimeType ? ` · ${mimeType}` : ""}
      </span>
    </div>
  );
}

function MessageStatusIcon({ status }: { status: ApiMessage["status"] }) {
  if (status === "sent") return <Check className="h-3.5 w-3.5 opacity-70" />;
  if (status === "delivered") return <CheckCheck className="h-3.5 w-3.5 opacity-70" />;
  if (status === "read") return <CheckCheck className="h-3.5 w-3.5 text-sky-300" />;
  if (status === "failed") return <AlertCircle className="h-3.5 w-3.5 text-destructive" />;
  return null;
}

function renderContent(message: ApiMessage) {
  const { message_type, content } = message;

  switch (message_type) {
    case "text":
      return <p className="whitespace-pre-wrap break-words text-sm">{content.text}</p>;

    case "template":
      return (
        <div className="space-y-1">
          <p className="whitespace-pre-wrap break-words text-sm">{content.text}</p>
          {content.template_name && (
            <p className="text-[11px] opacity-70">
              Template: {content.template_name}
              {content.language ? ` (${content.language})` : ""}
            </p>
          )}
          {content.variables && content.variables.length > 0 && (
            <p className="text-[11px] opacity-70">Variables: {content.variables.join(", ")}</p>
          )}
        </div>
      );

    case "system_event":
      return <p className="text-sm italic">{content.text}</p>;

    case "button":
      return <p className="text-sm">{content.text}</p>;

    case "interactive":
      return (
        <div className="space-y-2">
          {content.text && <p className="whitespace-pre-wrap break-words text-sm">{content.text}</p>}
          {content.buttons && content.buttons.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {content.buttons.map((b) => (
                <span key={b.id} className="rounded-full border border-current/30 px-2 py-0.5 text-[11px]">
                  {b.title}
                </span>
              ))}
            </div>
          )}
          {content.sections && content.sections.length > 0 && (
            <div className="space-y-1">
              {content.sections.map((s, i) => (
                <div key={i} className="text-[11px] opacity-80">
                  <p className="font-medium">{s.title}</p>
                  {s.rows.map((r) => (
                    <p key={r.id}>• {r.title}</p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case "location":
      return (
        <div className="space-y-1 text-sm">
          <p>{content.text || "Location shared"}</p>
          {content.latitude != null && content.longitude != null && (
            <a
              href={`https://www.google.com/maps?q=${content.latitude},${content.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs underline"
            >
              View on map
            </a>
          )}
        </div>
      );

    case "image":
      return (
        <div className="space-y-1">
          {content.media_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- backend upload host isn't known at build time
            <img
              src={content.media_url}
              alt={content.caption ?? "Image"}
              className="max-h-64 rounded-md object-cover"
            />
          ) : (
            <MediaPlaceholder icon={ImageIcon} label="Image received" mimeType={content.mime_type} />
          )}
          {content.caption && <p className="text-sm">{content.caption}</p>}
        </div>
      );

    case "audio":
      return content.media_url ? (
        <audio controls src={content.media_url} className="max-w-full" />
      ) : (
        <MediaPlaceholder icon={Mic} label="Audio received" mimeType={content.mime_type} />
      );

    case "video":
      return content.media_url ? (
        <video controls src={content.media_url} className="max-h-64 max-w-full rounded-md" />
      ) : (
        <MediaPlaceholder icon={VideoIcon} label="Video received" mimeType={content.mime_type} />
      );

    case "document":
      return content.media_url ? (
        <a
          href={content.media_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm underline"
        >
          <FileText className="h-4 w-4 shrink-0" /> {content.caption || "Document"}
        </a>
      ) : (
        <MediaPlaceholder icon={FileText} label="Document received" mimeType={content.mime_type} />
      );

    case "sticker":
      return <MediaPlaceholder icon={ImageIcon} label="Sticker" mimeType={content.mime_type} />;

    default:
      return (
        <div className="space-y-1">
          <p className="text-sm italic opacity-70">Unsupported message type ({message_type})</p>
          {content.raw != null && (
            <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded bg-black/10 p-1.5 text-[10px] opacity-80">
              {JSON.stringify(content.raw, null, 2)}
            </pre>
          )}
        </div>
      );
  }
}

interface MessageBubbleProps {
  message: ApiMessage;
  onRetry?: (messageId: string) => void;
  retrying?: boolean;
}

export function MessageBubble({ message, onRetry, retrying }: MessageBubbleProps) {
  if (message.direction === "system") {
    return (
      <div className="my-2 flex justify-center">
        <span className="rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
          {message.content.text}
        </span>
      </div>
    );
  }

  const isInternal = message.direction === "internal";
  const isOutbound = message.direction === "outbound";
  const canRetry =
    Boolean(onRetry) &&
    isOutbound &&
    message.status === "failed" &&
    RETRYABLE_TYPES.has(message.message_type);

  return (
    <div className={cn("flex", isOutbound || isInternal ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3 py-2 shadow-sm",
          isInternal
            ? "border border-amber-400/40 bg-amber-100 text-amber-950 dark:bg-amber-500/15 dark:text-amber-100"
            : isOutbound
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
        )}
      >
        {isInternal && (
          <div className="mb-1 flex items-center gap-1 text-[11px] font-medium opacity-80">
            <StickyNote className="h-3 w-3" /> Internal note · {message.sent_by.name ?? "Staff"}
          </div>
        )}
        {!isInternal && message.sent_by.role === "bot" && (
          <div className="mb-1 flex items-center gap-1 text-[11px] opacity-70">
            <Bot className="h-3 w-3" /> Bot
          </div>
        )}
        {!isInternal && isOutbound && message.sent_by.role === "staff" && message.sent_by.name && (
          <div className="mb-1 text-[11px] opacity-70">{message.sent_by.name}</div>
        )}

        {renderContent(message)}

        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
          <span>{displayTimeOnly(message.created_at)}</span>
          {isOutbound && !isInternal && <MessageStatusIcon status={message.status} />}
        </div>

        {canRetry && (
          <div className="mt-1.5 flex items-center justify-end gap-2">
            {message.error_reason && <span className="text-[10px] opacity-90">{message.error_reason}</span>}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-6 gap-1 px-2 text-[11px]"
              disabled={retrying}
              onClick={() => onRetry?.(message.id)}
            >
              {retrying ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
