"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";

export interface AppointmentFilterValues {
  /** Sent to the API. */
  doctorId?: string;
  /** "YYYY-MM-DD" — narrows the current tab client-side (the timeline always shows today). */
  date?: string;
}

interface AppointmentFiltersProps {
  value: AppointmentFilterValues;
  onChange: (value: AppointmentFilterValues) => void;
  /** Omit to hide the doctor filter (e.g. a doctor login only ever sees their own). */
  doctors?: { id: string; full_name: string }[];
}

const SELECT_CLASS =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AppointmentFilters({ value, onChange, doctors }: AppointmentFiltersProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeCount = [value.doctorId, value.date].filter(Boolean).length;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="outline"
        className="h-9 gap-2 shadow-none"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-[#1F7A4A] px-1.5 text-xs text-white dark:bg-primary dark:text-primary-foreground">
            {activeCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="Filters"
          className={cn(
            "absolute right-0 z-30 mt-2 w-72 space-y-3 rounded-xl border border-[#E3E9E5] bg-card p-4 shadow-lg dark:border-border"
          )}
        >
          {doctors && (
            <div>
              <label htmlFor="appt-filter-doctor" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Doctor
              </label>
              <select
                id="appt-filter-doctor"
                className={SELECT_CLASS}
                value={value.doctorId ?? ""}
                onChange={(e) => onChange({ ...value, doctorId: e.target.value || undefined })}
              >
                <option value="">All doctors</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="appt-filter-date" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Date
            </label>
            <Input
              id="appt-filter-date"
              type="date"
              className="h-9"
              value={value.date ?? ""}
              onChange={(e) => onChange({ ...value, date: e.target.value || undefined })}
            />
          </div>
          {activeCount > 0 && (
            <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => onChange({})}>
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
