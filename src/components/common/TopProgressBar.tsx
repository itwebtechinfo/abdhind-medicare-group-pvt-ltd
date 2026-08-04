"use client";

import { useEffect, useRef } from "react";
import { useLoader } from "@/src/hooks/useLoader";

/** Trickle never reaches this while still waiting — only the final "done" jumps past it. */
const TRICKLE_CEILING = 92;
/** How long the bar stays visible at 100% before fading — a completion
 * animation, not an artificial wait: the request has already settled. */
const FADE_MS = 250;

/**
 * Page-level route transition indicator — reacts to `isNavigating` only, not
 * API calls (those get their own signal, see ActivityPill). Two-stop gradient
 * (brand green → the existing sidebar-teal token) on purpose, kept to two
 * colors and a static direction rather than a hue-cycling sweep: a loud
 * rainbow bar reads as trendy for a season and dated a year later, a plain
 * restrained gradient doesn't.
 *
 * Driven entirely by real navigation timing (see RouteChangeProgress /
 * loaderSlice) — no fixed "show for N ms" logic.
 *
 * Animates via direct DOM/ref mutation rather than React state: this runs on
 * every animation frame while loading, and re-rendering the component that
 * often would be wasteful for what's purely a visual/external-system sync.
 */
export function TopProgressBar() {
  const { isNavigating } = useLoader();
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef(0);
  const progressRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    const bar = barRef.current;
    if (!container || !bar) return;

    if (isNavigating) {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
      container.style.opacity = "1";
      if (progressRef.current <= 0) {
        progressRef.current = 8;
        bar.style.width = "8%";
      }
      startRef.current = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startRef.current;
        // Asymptotic creep toward TRICKLE_CEILING: fast requests barely move
        // it, slow ones keep it climbing — purely a function of elapsed time.
        const next = TRICKLE_CEILING - TRICKLE_CEILING * Math.exp(-elapsed / 800);
        if (next > progressRef.current) {
          progressRef.current = next;
          bar.style.width = `${next}%`;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (progressRef.current > 0) {
      progressRef.current = 100;
      bar.style.width = "100%";
    }
    fadeTimeoutRef.current = setTimeout(() => {
      container.style.opacity = "0";
      progressRef.current = 0;
      bar.style.width = "0%";
    }, FADE_MS);

    return () => {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, [isNavigating]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] opacity-0 transition-opacity duration-200"
    >
      <div
        ref={barRef}
        className="h-full w-0 shadow-[0_0_8px_hsl(var(--primary)/0.6)] transition-[width] duration-200 ease-out"
        style={{
          backgroundImage: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--sidebar-primary)))",
        }}
      />
    </div>
  );
}
