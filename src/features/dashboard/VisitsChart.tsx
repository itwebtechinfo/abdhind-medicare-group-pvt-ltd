"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/src/lib/utils";
import { bucketLabel, formatCount, type ChartBucket, type VisitsChartData } from "./dashboard";

const HEIGHT = 260;
const PAD_TOP = 26;
const PAD_BOTTOM = 26;
const PAD_X = 8;
/** Narrowest a bar slot may get before the chart scrolls sideways (mobile). */
const MIN_SLOT = { month: 46, day: 30 } as const;

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

interface VisitsChartProps {
  data: Pick<VisitsChartData, "granularity" | "buckets"> & Partial<Pick<VisitsChartData, "trend" | "projection">>;
  /** Legend names, e.g. "2026" / "2025". */
  currentLabel: string;
  previousLabel: string;
  /** Month bars only: tap -> day-by-day drill-down. */
  onSelect?: (bucket: ChartBucket) => void;
}

/** Visits per month/day: bars (running month hatched), last year as a dashed
 * line, a trend line and the running month's projection. Hover or tap a bar
 * for its numbers; keyboard users can tab through the bars. */
export function VisitsChart({ data, currentLabel, previousLabel, onSelect }: VisitsChartProps) {
  const { buckets, granularity, trend, projection } = data;
  const [wrapRef, containerWidth] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const hatchId = useId().replace(/:/g, "");

  const n = buckets.length;
  const width = Math.max(containerWidth, n * MIN_SLOT[granularity] + PAD_X * 2);
  const slot = (width - PAD_X * 2) / Math.max(n, 1);
  const values = [
    ...buckets.map((b) => Math.max(b.visits, b.last_year)),
    trend?.start.value ?? 0,
    trend?.end.value ?? 0,
    projection?.value ?? 0,
  ];
  const max = Math.max(1, ...values) * 1.12;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const y = (v: number) => PAD_TOP + plotH - (Math.max(0, v) / max) * plotH;
  const cx = (i: number) => PAD_X + slot * i + slot / 2;
  const barW = Math.max(4, slot * 0.76);
  const showValues = slot >= 22;
  const labelEvery = slot >= 34 ? 1 : Math.ceil(34 / slot);
  const clickable = Boolean(onSelect) && granularity === "month";

  const lastYearPath = buckets.map((b, i) => `${i ? "L" : "M"}${cx(i)},${y(b.last_year)}`).join(" ");
  const activeBucket = active !== null ? buckets[active] : null;

  return (
    // min-w-0: inside a grid/flex parent (dialog, card) the wide SVG must
    // scroll in its own box instead of stretching the parent.
    <div className="relative w-full min-w-0">
      <div ref={wrapRef} className="-mx-1 w-full overflow-x-auto px-1 pb-1">
        {containerWidth > 0 && (
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={`Visits per ${granularity}: ${buckets
              .map((b) => `${bucketLabel(b.key)} ${b.visits}${b.partial ? " so far" : ""}`)
              .join(", ")}`}
            className="block select-none"
            onMouseLeave={() => setActive(null)}
          >
            <defs>
              <pattern id={hatchId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="6" height="6" className="fill-[#1F7A4A]/25 dark:fill-emerald-500/25" />
                <line x1="0" y1="0" x2="0" y2="6" strokeWidth="3" className="stroke-[#1F7A4A] dark:stroke-emerald-500" />
              </pattern>
            </defs>

            {/* baseline */}
            <line x1={PAD_X} x2={width - PAD_X} y1={y(0)} y2={y(0)} className="stroke-border" />

            {buckets.map((b, i) => {
              const top = y(b.visits);
              const label = `${bucketLabel(b.key)}${b.partial ? " (so far)" : ""}: ${formatCount(b.visits)} visits, ${previousLabel}: ${formatCount(b.last_year)}`;
              return (
                <g
                  key={b.key}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  onClick={() => (clickable ? onSelect?.(b) : setActive(active === i ? null : i))}
                  onKeyDown={(e) => {
                    if (clickable && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onSelect?.(b);
                    }
                  }}
                  tabIndex={0}
                  role={clickable ? "button" : undefined}
                  aria-label={clickable ? `${label}. Open day by day` : label}
                  className={cn("outline-none", clickable && "cursor-pointer")}
                >
                  {/* full-height hit area */}
                  <rect x={cx(i) - slot / 2} y={PAD_TOP} width={slot} height={plotH} fill="transparent" />
                  <rect
                    x={cx(i) - barW / 2}
                    y={top}
                    width={barW}
                    height={Math.max(0, y(0) - top)}
                    rx={2}
                    fill={b.partial ? `url(#${hatchId})` : undefined}
                    className={cn(
                      !b.partial && "fill-[#1F7A4A] dark:fill-emerald-600",
                      active === i && "opacity-80"
                    )}
                  />
                  {showValues && (
                    <text x={cx(i)} y={top - 6} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
                      {formatCount(b.visits)}
                    </text>
                  )}
                  {i % labelEvery === 0 && (
                    <text x={cx(i)} y={HEIGHT - 8} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                      {bucketLabel(b.key)}
                      {b.partial ? "*" : ""}
                    </text>
                  )}
                </g>
              );
            })}

            {/* last year */}
            {n > 1 && (
              <path d={lastYearPath} fill="none" strokeDasharray="5 4" strokeWidth={1.5}
                    className="pointer-events-none stroke-zinc-400 dark:stroke-zinc-500" />
            )}

            {/* trend + projection */}
            {trend && n > 1 && (
              <line
                x1={cx(0)} y1={y(trend.start.value)} x2={cx(n - 1)} y2={y(trend.end.value)}
                strokeWidth={2} className="pointer-events-none stroke-[#E07B39]"
              />
            )}
            {projection && (
              <circle
                cx={cx(buckets.findIndex((b) => b.key === projection.key))}
                cy={y(projection.value)} r={4}
                className="pointer-events-none fill-[#E07B39]"
              />
            )}
          </svg>
        )}
      </div>

      {activeBucket && active !== null && (
        <div
          role="status"
          className="pointer-events-none absolute top-0 z-10 min-w-36 -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md"
          style={{ left: Math.min(Math.max(cx(active), 80), Math.max(containerWidth - 80, 80)) }}
        >
          <p className="font-semibold">
            {bucketLabel(activeBucket.key)} {activeBucket.key.slice(0, 4)}
            {activeBucket.partial && <span className="font-normal text-muted-foreground"> · so far</span>}
          </p>
          <p>
            {currentLabel}: <span className="font-semibold tabular-nums">{formatCount(activeBucket.visits)}</span> visits
          </p>
          <p className="text-muted-foreground">
            {previousLabel}: <span className="tabular-nums">{formatCount(activeBucket.last_year)}</span>
          </p>
          {projection?.key === activeBucket.key && (
            <p className="text-[#C2621F] dark:text-orange-300">At this pace ≈ {formatCount(projection.value)}</p>
          )}
          {clickable && <p className="mt-1 text-muted-foreground">Click for day by day</p>}
        </div>
      )}

      {/* Screen readers get the numbers as a table. */}
      <table className="sr-only">
        <caption>Visits per {granularity}</caption>
        <thead>
          <tr><th>{granularity === "month" ? "Month" : "Day"}</th><th>{currentLabel}</th><th>{previousLabel}</th></tr>
        </thead>
        <tbody>
          {buckets.map((b) => (
            <tr key={b.key}><td>{bucketLabel(b.key)}{b.partial ? " (so far)" : ""}</td><td>{b.visits}</td><td>{b.last_year}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
