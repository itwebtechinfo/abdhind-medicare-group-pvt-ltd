import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/src/lib/store";

interface LoaderState {
  /** Count of in-flight network requests (axios) — counter, not boolean, so
   * concurrent requests don't hide the loader when only one of them finishes. */
  activeRequests: number;
  /** Route transition in progress (App Router doesn't expose a single
   * "navigation settled" request to count, so this is tracked as a flag). */
  isNavigating: boolean;
}

const initialState: LoaderState = {
  activeRequests: 0,
  isNavigating: false,
};

const loaderSlice = createSlice({
  name: "loader",
  initialState,
  reducers: {
    requestStarted: (state) => {
      state.activeRequests += 1;
    },
    requestFinished: (state) => {
      state.activeRequests = Math.max(0, state.activeRequests - 1);
    },
    navigationStarted: (state) => {
      state.isNavigating = true;
    },
    navigationFinished: (state) => {
      state.isNavigating = false;
    },
  },
});

export const { requestStarted, requestFinished, navigationStarted, navigationFinished } =
  loaderSlice.actions;

/** Two distinct signals by design, not one merged flag: a page-level route
 * transition (top bar) reads differently to the user than a background API
 * call (corner activity pill), so components pick the one relevant to them. */
export const selectIsNavigating = (state: RootState): boolean => state.loader.isNavigating;
export const selectIsRequestActive = (state: RootState): boolean => state.loader.activeRequests > 0;

/** Either signal — for generic "is anything happening" consumers (useLoader's `isLoading`). */
export const selectIsLoading = (state: RootState): boolean =>
  selectIsRequestActive(state) || selectIsNavigating(state);

export default loaderSlice.reducer;
