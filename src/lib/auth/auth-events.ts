type SessionEndedListener = () => void;

const listeners = new Set<SessionEndedListener>();

/**
 * Bridges the axios layer (outside React) to AuthProvider's in-memory state.
 * Clearing storage alone doesn't update the React context, so a stale
 * session would keep passing route guards until the next full reload —
 * this lets api-client tell AuthProvider to drop its state immediately.
 */
export const authEvents = {
  onSessionEnded(listener: SessionEndedListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  emitSessionEnded(): void {
    listeners.forEach((listener) => listener());
  },
};
