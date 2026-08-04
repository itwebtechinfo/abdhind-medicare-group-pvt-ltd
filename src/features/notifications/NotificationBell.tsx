"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarCheck,
  CalendarPlus,
  CalendarX,
  CheckCheck,
  Clock,
  Inbox,
  Mail,
  MessageCircleWarning,
  UserCheck,
  UserX,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import {
  buildDummyNotifications,
  formatTimeAgo,
  type AppNotification,
  type NotificationType,
} from "./notification";

const TYPE_META: Record<
  NotificationType,
  { icon: LucideIcon; iconClass: string; bgClass: string }
> = {
  appointment_new: {
    icon: CalendarPlus,
    iconClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-500/15",
  },
  appointment_confirmed: {
    icon: CalendarCheck,
    iconClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-500/15",
  },
  appointment_cancelled: {
    icon: CalendarX,
    iconClass: "text-rose-600 dark:text-rose-400",
    bgClass: "bg-rose-500/15",
  },
  followup_reminder: {
    icon: Clock,
    iconClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-500/15",
  },
  message_failed: {
    icon: MessageCircleWarning,
    iconClass: "text-destructive",
    bgClass: "bg-destructive/15",
  },
  enquiry_new: {
    icon: Mail,
    iconClass: "text-violet-600 dark:text-violet-400",
    bgClass: "bg-violet-500/15",
  },
  doctor_linked: {
    icon: UserCheck,
    iconClass: "text-teal-600 dark:text-teal-400",
    bgClass: "bg-teal-500/15",
  },
  doctor_unlinked: {
    icon: UserX,
    iconClass: "text-slate-600 dark:text-slate-400",
    bgClass: "bg-slate-500/15",
  },
};

const DISMISS_ANIMATION_MS = 200;
const CLOSE_ANIMATION_MS = 150;

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    buildDummyNotifications()
  );
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [dismissingIds, setDismissingIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

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
      if (!containerRef.current?.contains(event.target as Node)) {
        closePanel();
      }
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

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const dismiss = (id: string) => {
    setDismissingIds((prev) => new Set(prev).add(id));
    window.setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setDismissingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, DISMISS_ANIMATION_MS);
  };

  const handleViewAll = () => {
    console.log("View all notifications — hooked up once the API lands.");
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="Notifications"
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
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80 disabled:pointer-events-none disabled:text-muted-foreground disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all as read
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No new notifications</p>
              <p className="text-xs text-muted-foreground">
                You&apos;re all caught up. New activity will show up here.
              </p>
            </div>
          ) : (
            <ul className="max-h-[26rem] divide-y divide-border overflow-y-auto">
              {notifications.map((notification) => {
                const meta = TYPE_META[notification.type];
                const Icon = meta.icon;
                const isDismissing = dismissingIds.has(notification.id);

                return (
                  <li
                    key={notification.id}
                    className={cn(
                      "group relative flex gap-3 px-4 py-3 transition-all duration-200 ease-out",
                      isDismissing
                        ? "max-h-0 -translate-x-2 overflow-hidden !py-0 opacity-0"
                        : "max-h-40 cursor-pointer opacity-100",
                      !notification.isRead && !isDismissing && "bg-primary/5 hover:bg-primary/10",
                      notification.isRead && !isDismissing && "hover:bg-muted/60"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        meta.bgClass
                      )}
                    >
                      <Icon className={cn("h-4 w-4", meta.iconClass)} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm leading-snug",
                            notification.isRead
                              ? "font-medium text-foreground/80"
                              : "font-semibold text-foreground"
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p
                        className={cn(
                          "mt-0.5 line-clamp-2 text-xs leading-snug",
                          notification.isRead
                            ? "text-muted-foreground/80"
                            : "text-muted-foreground"
                        )}
                      >
                        {notification.description}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-label="Dismiss notification"
                      onClick={(event) => {
                        event.stopPropagation();
                        dismiss(notification.id);
                      }}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-border p-2">
            <button
              type="button"
              onClick={handleViewAll}
              className="w-full rounded-md py-2 text-center text-xs font-medium text-primary transition-colors hover:bg-primary/5 hover:text-primary/80"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
