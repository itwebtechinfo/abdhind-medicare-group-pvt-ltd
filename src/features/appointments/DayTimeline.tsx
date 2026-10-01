"use client";

import { useMemo } from "react";
import { Skeleton } from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";
import {
  formatClock,
  getDisplayStatus,
  splitAppointmentDateTime,
  type ApiAppointment,
  type DisplayStatus,
} from "./appointment";
import { APPT_UI, STATUS_META } from "./StatusBadge";

/** Clinic day shown on the rail, 24h clock. Appointments outside it are pinned to the nearest edge. */
export const TIMELINE_START_HOUR = 10;
export const TIMELINE_END_HOUR = 20;
/** How much of the rail one block covers — wide enough for a name + time. */
const BLOCK_MINUTES = 55;
const LANE_HEIGHT_PX = 52;

const RAIL_START = TIMELINE_START_HOUR * 60;
const RAIL_LENGTH = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 60;

const LEGEND: DisplayStatus[] = ["needs_approval", "confirmed", "in_clinic", "completed", "no_show"];

function railPercent(minutes: number) {
  return ((minutes - RAIL_START) / RAIL_LENGTH) * 100;
}

function hourLabel(hour: number) {
  // "10 AM", "11", "12 PM", "1", ... — period only at the start and at noon, like the mockup.
  const { period } = formatClock(hour * 60);
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return hour === TIMELINE_START_HOUR || hour === 12 ? `${h12} ${period}` : String(h12);
}

interface DayTimelineProps {
  /** Today's appointments (cancelled ones already excluded). */
  appointments: ApiAppointment[];
  /** Minutes since IST midnight, or null before the client clock is known. */
  nowMinutes: number | null;
  isLoading: boolean;
  onSelect: (appointment: ApiAppointment) => void;
}

export function DayTimeline({ appointments, nowMinutes, isLoading, onSelect }: DayTimelineProps) {
  const { blocks, laneCount, summary } = useMemo(() => {
    const sorted = [...appointments].sort((a, b) =>
      a.appointment_datetime.localeCompare(b.appointment_datetime)
    );
    // Greedy lane packing so blocks that would overlap stack instead of hiding each other.
    const laneEnds: number[] = [];
    const placed = sorted.map((appointment) => {
      const { minutes } = splitAppointmentDateTime(appointment.appointment_datetime);
      const start = Math.min(Math.max(minutes, RAIL_START), RAIL_START + RAIL_LENGTH - BLOCK_MINUTES);
      let lane = laneEnds.findIndex((end) => end <= start);
      if (lane === -1) lane = laneEnds.length;
      laneEnds[lane] = start + BLOCK_MINUTES;
      return { appointment, minutes, start, lane, status: getDisplayStatus(appointment) };
    });

    const count = (status: DisplayStatus) => placed.filter((b) => b.status === status).length;
    return {
      blocks: placed,
      laneCount: Math.max(laneEnds.length, 1),
      summary: [
        `${appointments.length} appointment${appointments.length === 1 ? "" : "s"}`,
        `${count("completed")} done`,
        `${count("in_clinic")} in clinic`,
        `${count("needs_approval")} waiting for approval`,
      ].join(" · "),
    };
  }, [appointments]);

  const hours = Array.from(
    { length: TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1 },
    (_, i) => TIMELINE_START_HOUR + i
  );
  const nowInRange = nowMinutes !== null && nowMinutes >= RAIL_START && nowMinutes <= RAIL_START + RAIL_LENGTH;
  const nowClock = nowMinutes !== null ? formatClock(nowMinutes) : null;

  return (
    <section className={cn(APPT_UI.card, "p-4 sm:p-5")}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className={cn("text-base font-semibold", APPT_UI.ink)}>Today at the clinic</h2>
          {isLoading ? (
            <Skeleton className="h-4 w-64" />
          ) : (
            <p className="text-sm text-muted-foreground">{summary}</p>
          )}
        </div>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {LEGEND.map((status) => (
            <li key={status} className="flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", STATUS_META[status].dot)} />
              {STATUS_META[status].label}
            </li>
          ))}
        </ul>
      </div>

      <div className="-mx-1 mt-1 overflow-x-auto px-1 pb-1 pt-6">
        <div className="relative min-w-[720px]">
          {/* Blocks */}
          <div className="relative" style={{ height: laneCount * LANE_HEIGHT_PX + 8 }}>
            {hours.map((hour) => (
              <span
                key={hour}
                aria-hidden
                className="absolute inset-y-0 w-px bg-[#E3E9E5] dark:bg-border"
                style={{ left: `${railPercent(hour * 60)}%` }}
              />
            ))}

            {isLoading
              ? [0, 1, 2].map((i) => (
                  <Skeleton
                    key={i}
                    className="absolute top-2 h-11"
                    style={{ left: `${8 + i * 30}%`, width: `${(BLOCK_MINUTES / RAIL_LENGTH) * 100}%` }}
                  />
                ))
              : blocks.map(({ appointment, minutes, start, lane, status }) => {
                  const clock = formatClock(minutes);
                  return (
                    <button
                      key={appointment.id}
                      type="button"
                      onClick={() => onSelect(appointment)}
                      title={`${appointment.patient?.full_name ?? "Patient"} · ${clock.time} ${clock.period} · ${STATUS_META[status].label}`}
                      className={cn(
                        "absolute flex h-11 flex-col justify-center overflow-hidden rounded-md border-l-[3px] px-2 text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        STATUS_META[status].block,
                        status === "completed" && "opacity-75"
                      )}
                      style={{
                        left: `${railPercent(start)}%`,
                        width: `calc(${(BLOCK_MINUTES / RAIL_LENGTH) * 100}% - 4px)`,
                        top: 4 + lane * LANE_HEIGHT_PX,
                      }}
                    >
                      <span className="truncate text-xs font-semibold">
                        {appointment.patient?.full_name ?? "Patient"}
                      </span>
                      <span className="truncate text-[11px] opacity-80">{clock.time}</span>
                    </button>
                  );
                })}

            {nowInRange && nowClock && (
              <div
                className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-red-600"
                style={{ left: `${railPercent(nowMinutes as number)}%` }}
              >
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold text-red-700 dark:text-red-400">
                  {nowClock.time} {nowClock.period}
                </span>
              </div>
            )}
          </div>

          {/* Hour axis */}
          <div className="relative mt-2 h-4 text-xs text-muted-foreground">
            {hours.map((hour) => (
              <span
                key={hour}
                className={cn(
                  "absolute whitespace-nowrap",
                  hour === TIMELINE_END_HOUR ? "-translate-x-full" : hour > TIMELINE_START_HOUR && "-translate-x-1/2"
                )}
                style={{ left: `${railPercent(hour * 60)}%` }}
              >
                {hourLabel(hour)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {!isLoading && appointments.length === 0 && (
        <p className="mt-2 text-sm text-muted-foreground">No appointments scheduled for today.</p>
      )}
    </section>
  );
}
