/**
 * While the WhatsApp inbox is open, its /inbox/sync call already carries the
 * notification bell's unread count, so the bell stops polling on its own and
 * only refetches when that count changes. Shared via src/lib (not a feature
 * file) because both features/inbox and features/notifications read it.
 */
type Listener = () => void;

let active = false;
const listeners = new Set<Listener>();

export const inboxSyncBridge = {
  setActive(value: boolean) {
    if (active === value) return;
    active = value;
    listeners.forEach((l) => l());
  },
  isActive: () => active,
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
