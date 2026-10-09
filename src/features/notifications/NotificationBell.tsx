"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AtSign, Bell, CalendarClock, Check, CheckCheck, Hourglass, Inbox, Mail, type LucideIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { inboxSyncBridge } from "@/src/lib/inbox-sync-bridge";
import { POLL_INTERVALS } from "@/src/lib/polling";
import { toast } from "@/src/lib/toast";
import { cn } from "@/src/lib/utils";
import {
  describeNotification,
  OPEN_NOTIFICATIONS_EVENT,
  formatTimeAgo,
  notificationService,
  type AppNotification,
  type NotificationType,
} from "./notification";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

const TYPE_META: Record<NotificationType, { icon: LucideIcon; iconClass: string; bgClass: string }> = {
  enquiry_new: {
    icon: Mail,
    iconClass: "text-violet-600 dark:text-violet-400",
    bgClass: "bg-violet-500/15",
  },
  appointment_pending: {
    icon: CalendarClock,
    iconClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-500/15",
  },
  inbox_mention: {
    icon: AtSign,
    iconClass: "text-sky-600 dark:text-sky-400",
    bgClass: "bg-sky-500/15",
  },
  inbox_waiting: {
    icon: Hourglass,
    iconClass: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-500/15",
  },
};

const CLOSE_ANIMATION_MS = 150;

type NotificationsData = { items: AppNotification[]; unread_count: number };

export function NotificationBell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // "Open to-do" on the dashboard opens this panel.
  useEffect(() => {
    const openPanel = () => setOpen(true);
    window.addEventListener(OPEN_NOTIFICATIONS_EVENT, openPanel);
    return () => window.removeEventListener(OPEN_NOTIFICATIONS_EVENT, openPanel);
  }, []);

  // Real items from GET /notifications (enquiries NEW + appointments PENDING,
  // RBAC-filtered server-side). Polls every minute while the tab is visible
  // and refetches as soon as the tab regains focus.
  // While the WhatsApp inbox is open its sync call carries this count and
  // invalidates this query when it changes - so no second poll from here.
  const inboxSyncing = useSyncExternalStore(inboxSyncBridge.subscribe, inboxSyncBridge.isActive, () => false);
  const { data, isLoading } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => (await notificationService.list()).data,
    refetchInterval: inboxSyncing ? false : POLL_INTERVALS.notifications,
    // "always": refetch on focus even if the last poll is still within the
    // app-wide 60s staleTime — coming back to the tab should show new items.
    refetchOnWindowFocus: inboxSyncing ? false : "always",
  });
  const items = data?.items ?? [];
  const unreadCount = data?.unread_count ?? 0;

  // Optimistic: flip the item(s) to read and drop the count right away.
  const applyRead = (predicate: (n: AppNotification) => boolean) => {
    const previous = queryClient.getQueryData<NotificationsData>(NOTIFICATIONS_QUERY_KEY);
    if (previous) {
      const newlyRead = previous.items.filter((n) => !n.is_read && predicate(n)).length;
      queryClient.setQueryData<NotificationsData>(NOTIFICATIONS_QUERY_KEY, {
        items: previous.items.map((n) => (predicate(n) ? { ...n, is_read: true } : n)),
        unread_count: Math.max(0, previous.unread_count - newlyRead),
      });
    }
    return previous;
  };

  const markReadMutation = useMutation({
    mutationFn: (keys: string[]) => notificationService.markRead(keys),
    onMutate: (keys) => ({ previous: applyRead((n) => keys.includes(n.key)) }),
    onError: (_err, _keys, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, ctx.previous);
      toast.error("Couldn't mark as read");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onMutate: () => {
      const previous = applyRead(() => true);
      // The server count also covers items beyond the listed ones.
      queryClient.setQueryData<NotificationsData>(NOTIFICATIONS_QUERY_KEY, (d) => d && { ...d, unread_count: 0 });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, ctx.previous);
      toast.error("Couldn't mark all as read");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });

  const closePanel = () => {
    if (!open || closing) return;
    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, CLOSE_ANIMATION_MS);
  };

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) closePanel();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, closing]);

  const openItem = (n: AppNotification) => {
    if (!n.is_read) markReadMutation.mutate([n.key]);
    closePanel();
    router.push(describeNotification(n).href);
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-expanded={open}
        onClick={() => (open ? closePanel() : setOpen(true))}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span
            key={unreadCount}
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] animate-in items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-2 ring-card zoom-in-50 duration-200"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          className={cn(
            "absolute right-0 top-full z-50 mt-2 w-[calc(100vw-1.5rem)] max-w-sm origin-top-right overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg sm:w-96",
            closing
              ? "animate-out fade-out-0 slide-out-to-top-2 duration-150"
              : "animate-in fade-in-0 slide-in-from-top-2 duration-200"
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            <button
              type="button"
              onClick={() => markAllMutation.mutate()}
              disabled={unreadCount === 0 || markAllMutation.isPending}
              className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80 disabled:pointer-events-none disabled:text-muted-foreground disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all as read
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Nothing needs your attention</p>
              <p className="text-xs text-muted-foreground">
                New enquiries and appointments waiting for approval will show up here.
              </p>
            </div>
          ) : (
            <ul className="max-h-[26rem] divide-y divide-border overflow-y-auto">
              {items.map((n) => {
                const meta = TYPE_META[n.type];
                const Icon = meta.icon;
                const { title, description } = describeNotification(n);
                return (
                  <li key={n.key} className="relative">
                    <button
                      type="button"
                      onClick={() => openItem(n)}
                      className={cn(
                        "flex w-full gap-3 px-4 py-3 pr-11 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                        n.is_read ? "hover:bg-muted/60" : "bg-primary/5 hover:bg-primary/10"
                      )}
                    >
                      <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", meta.bgClass)}>
                        <Icon className={cn("h-4 w-4", meta.iconClass)} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block text-sm leading-snug",
                            n.is_read ? "font-medium text-foreground/80" : "font-semibold text-foreground"
                          )}
                        >
                          {title}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 line-clamp-2 block text-xs leading-snug",
                            n.is_read ? "text-muted-foreground/80" : "text-muted-foreground"
                          )}
                        >
                          {description}
                        </span>
                        <span className="mt-1 block text-[11px] text-muted-foreground">{formatTimeAgo(n.created_at)}</span>
                      </span>
                    </button>
                    {!n.is_read && (
                      <button
                        type="button"
                        aria-label="Mark as read"
                        title="Mark as read"
                        onClick={() => markReadMutation.mutate([n.key])}
                        className="absolute right-2 top-3 flex h-7 w-7 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
