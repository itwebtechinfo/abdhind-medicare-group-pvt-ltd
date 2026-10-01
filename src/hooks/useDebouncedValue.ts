"use client";

import { useEffect, useState } from "react";

/** Waits for `value` to stop changing for `delayMs` before updating — keeps
 * typing in a search/preview field from firing a request per keystroke. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
