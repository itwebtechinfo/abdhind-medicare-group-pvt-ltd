"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";

type BadgeVariant = "secondary" | "warning" | "success" | "destructive" | "outline";

interface WhatsAppPageHeaderProps {
  icon: LucideIcon;
  title: string;
  /** Small live-data chips, e.g. "12 approved" — keeps the page glanceable
   * without a paragraph of description text under the title. */
  badges?: { label: string; variant?: BadgeVariant }[];
  /** Pulsing dot next to the title — reserved for the Inbox page, where it
   * signals the chat list is actively polling. */
  live?: boolean;
  backHref?: string;
  backLabel?: string;
}

/** Shared slim header for the WhatsApp module's non-Inbox pages (Broadcast,
 * Templates) — same icon-chip/title/badge language as the Inbox page's
 * in-panel header, kept as a plain row here (not a bordered card) since
 * these pages hold a grid of separate Cards below, not one flush panel. */
export function WhatsAppPageHeader({ icon: Icon, title, badges = [], live, backHref, backLabel }: WhatsAppPageHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <h1 className="text-lg font-semibold leading-tight">{title}</h1>
      {live && (
        <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      )}
      {badges.map((b) => (
        <Badge key={b.label} variant={b.variant ?? "secondary"} className="font-normal">
          {b.label}
        </Badge>
      ))}
      {backHref && (
        <Button asChild size="sm" variant="outline" className="ml-auto gap-2">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel ?? "Back"}
          </Link>
        </Button>
      )}
    </div>
  );
}
