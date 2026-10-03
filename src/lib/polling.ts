/**
 * Every background refetch interval in one place, so server load is easy to
 * reason about and tune. React Query already pauses all of these while the
 * browser tab is hidden (refetchIntervalInBackground defaults to false).
 */
export const POLL_INTERVALS = {
  /** WhatsApp inbox: /inbox/sync is the page's ONLY periodic request (list,
   * open chat, counts, presence and the bell's count all ride on it). */
  inboxSyncVisible: 10_000,
  /** …while the tab is hidden (it also re-syncs at once on focus). */
  inboxSyncHidden: 60_000,
  /** Template/broadcast activity feed on the Templates page. */
  activityFeed: 60_000,
  /** WhatsApp section-wide "template approved / broadcast done" toasts. */
  activityWatcher: 60_000,
  /** A broadcast that is actively sending. */
  broadcastSending: 5_000,
  /** A broadcast scheduled for later — nothing changes until it's due. */
  broadcastScheduled: 60_000,
  /** Template requests / system templates still awaiting Meta review (takes minutes to hours). */
  templateReview: 30_000,
  /** Topbar notification bell (also refetches when the tab regains focus).
   * Paused while the WhatsApp inbox is open - its sync carries the count. */
  notifications: 60_000,
} as const;
