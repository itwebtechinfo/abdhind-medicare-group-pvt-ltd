import { store } from "@/src/lib/store";
import {
  requestStarted,
  requestFinished,
  navigationStarted,
  navigationFinished,
} from "@/src/lib/loaderSlice";

/**
 * Plain functions (not a hook) on purpose — dispatched directly against the
 * store singleton so this is callable from services/api-client.ts's Axios
 * interceptors and the route-change listener, neither of which are React
 * components. Mirrors src/lib/toast.ts's non-hook wrapper for the same reason.
 *
 * Dispatches are deferred to a microtask because navigationStart/navigationEnd
 * get invoked synchronously from inside `window.history.pushState`, which
 * Next's App Router itself calls from a useInsertionEffect during commit — a
 * synchronous dispatch there re-enters React while it's still mid-commit and
 * trips "useInsertionEffect must not schedule updates". Deferring to a
 * microtask lets that commit finish first; the delay is imperceptible.
 */
const dispatch = (action: { type: string }) => queueMicrotask(() => store.dispatch(action));

export const loaderController = {
  requestStart: () => dispatch(requestStarted()),
  requestEnd: () => dispatch(requestFinished()),
  navigationStart: () => dispatch(navigationStarted()),
  navigationEnd: () => dispatch(navigationFinished()),
};
