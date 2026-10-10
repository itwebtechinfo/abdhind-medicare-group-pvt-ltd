"use client";

import { Fragment, type ReactNode } from "react";
import { ExternalLink, Reply } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { fillSegments, type TemplateContent } from "./templates";

/** WhatsApp's own *bold* / _italic_ / ~strike~ inside one text run. */
function formatRun(text: string, key: string): ReactNode {
  const parts = text.split(/(\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~)/g);
  return parts.map((p, i) => {
    if (/^\*[^*]+\*$/.test(p)) return <strong key={`${key}-${i}`}>{p.slice(1, -1)}</strong>;
    if (/^_[^_]+_$/.test(p)) return <em key={`${key}-${i}`}>{p.slice(1, -1)}</em>;
    if (/^~[^~]+~$/.test(p)) return <s key={`${key}-${i}`}>{p.slice(1, -1)}</s>;
    return <Fragment key={`${key}-${i}`}>{p}</Fragment>;
  });
}

interface PhonePreviewProps {
  content: TemplateContent;
  sampleValues: string[];
  clinicName: string;
  /** Shown when there's nothing to preview yet (e.g. an empty form). */
  emptyText?: string;
}

/** "What the patient will see": the template rendered like a WhatsApp chat,
 * sample values highlighted. */
export function PhonePreview({ content, sampleValues, clinicName, emptyText = "Nothing to preview yet" }: PhonePreviewProps) {
  const segments = fillSegments(content.body, sampleValues);
  return (
    <figure
      aria-label="Message preview"
      className="mx-auto w-full max-w-[320px] overflow-hidden rounded-[28px] border-[6px] border-[#17261F] bg-[#EFE7DC] shadow-md dark:border-zinc-700 dark:bg-zinc-900"
    >
      <div className="flex items-center gap-2 bg-[#1F7A4A] px-4 py-3 text-sm font-semibold text-white">
        <span aria-hidden>🦷</span>
        <span className="truncate">{clinicName}</span>
      </div>
      <div className="min-h-64 bg-[radial-gradient(#d9cfc1_1px,transparent_1px)] p-3 [background-size:14px_14px] dark:bg-[radial-gradient(#3f3f46_1px,transparent_1px)]">
        {!content.body ? (
          <p className="mt-20 text-center text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <>
            <div className="rounded-lg rounded-tl-none bg-white p-3 text-[13px] leading-snug text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100">
              {content.header && <p className="mb-1.5 font-semibold">{formatRun(content.header, "h")}</p>}
              <p className="whitespace-pre-wrap break-words">
                {segments.map((s, i) =>
                  s.variable ? (
                    <mark
                      key={i}
                      title={`Variable {{${s.variable}}}`}
                      className="rounded bg-amber-100 px-0.5 text-inherit dark:bg-amber-500/30"
                    >
                      {s.text}
                    </mark>
                  ) : (
                    <Fragment key={i}>{formatRun(s.text, String(i))}</Fragment>
                  )
                )}
              </p>
              {content.footer && <p className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">{content.footer}</p>}
              <p className="mt-1 text-right text-[10px] text-zinc-400">10:42</p>
            </div>
            {content.buttons.length > 0 && (
              <div className="mt-1 space-y-1">
                {content.buttons.map((b, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg bg-white py-2 text-[13px] font-medium text-[#0B7DD8] shadow-sm dark:bg-zinc-800 dark:text-sky-400"
                    )}
                  >
                    {b.type === "URL" ? <ExternalLink className="h-3.5 w-3.5" /> : <Reply className="h-3.5 w-3.5" />}
                    {b.text}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </figure>
  );
}
