"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, CalendarX, Download, ListChecks, Plus, Search, XCircle } from "lucide-react";
import { Can } from "@/src/components/rbac/PermissionGate";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useMinuteClock } from "@/src/hooks/useMinuteClock";
import { usePermission } from "@/src/hooks/usePermission";
import { toast } from "@/src/lib/toast";
import { cn } from "@/src/lib/utils";
import type { NormalizedApiError } from "@/src/types/api";
import { doctorService } from "@/src/features/doctors/doctor";
import {
  appointmentService,
  BULK_CANCEL_TABS,
  formatClock,
  formatCreatedAt,
  getDisplayStatus,
  istNow,
  sourceLabel,
  splitAppointmentDateTime,
  type ApiAppointment,
  type AppointmentTabCounts,
  type CreateAppointmentPayload,
  type DisplayStatus,
} from "./appointment";
import { AppointmentDrawer } from "./AppointmentDrawer";
import { AppointmentFilters, type AppointmentFilterValues } from "./AppointmentFilters";
import { APPOINTMENT_ROW_GRID, AppointmentRow } from "./AppointmentRow";
import { AppointmentTabs, type AppointmentTab } from "./AppointmentTabs";
import { BookAppointmentDialog } from "./BookAppointmentDialog";
import { BulkCancelDialog } from "./BulkCancelDialog";
import { ConfirmAppointmentDialog } from "./ConfirmAppointmentDialog";
import { DayTimeline } from "./DayTimeline";
import { DeclineDialog } from "./DeclineDialog";
import { FollowUpDialog } from "./FollowUpDialog";
import { RescheduleDialog } from "./RescheduleDialog";
import { APPT_UI, STATUS_META } from "./StatusBadge";

const APPOINTMENTS_QUERY_KEY = ["appointments"] as const;

interface Row {
  appointment: ApiAppointment;
  status: DisplayStatus;
  date: string;
}

const EMPTY_STATES: Record<AppointmentTab, { title: string; hint: string }> = {
  today: { title: "No appointments today", hint: "Today's bookings will show up here." },
  needs_approval: { title: "No appointments need approval", hint: "You're all caught up." },
  upcoming: { title: "No upcoming appointments", hint: "Confirmed and pending future bookings appear here." },
  past: { title: "No past appointments", hint: "Earlier visits will show up here." },
  cancelled: { title: "No cancelled or no-show appointments", hint: "Nothing to follow up on." },
};

/** History tabs grow without bound, so they're paged; the rest are naturally small. */
const PAGED_TABS: AppointmentTab[] = ["past", "cancelled"];
const PAGE_SIZE = 50;
const EMPTY_COUNTS: AppointmentTabCounts = { today: 0, needs_approval: 0, upcoming: 0, past: 0, cancelled: 0 };

/** Rows the backend can still cancel (PENDING / APPROVED / PATIENT_CONFIRMED). */
const CANCELLABLE: DisplayStatus[] = ["needs_approval", "confirmed", "no_show", "in_clinic"];

/** Bulk-cancel selection, tied to the list it was made on — changing tab,
 * search or filters simply makes it stale (= empty) instead of carrying
 * hidden rows along. */
interface Selection {
  listKey: string;
  ids: ReadonlySet<string>;
  /** "Select all N matching": the server resolves the filter at confirm time. */
  allMatching: boolean;
}

/** Mutation responses are the bare appointment doc (no patient/doctor/booked_by
 * join) — keep the joined data we already have. */
function mergeJoined(updated: ApiAppointment, prev: ApiAppointment): ApiAppointment {
  return {
    ...updated,
    patient: updated.patient ?? prev.patient,
    doctor: updated.doctor ?? prev.doctor,
    booked_by: updated.booked_by ?? prev.booked_by,
  };
}

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function exportCsv(rows: Row[], fileName: string) {
  const header = ["Booking ID", "Date", "Time", "Patient", "Phone", "Doctor", "Booked via", "Booked by", "Status", "Cancellation reason", "Created"];
  const lines = rows.map(({ appointment: a, status, date }) => {
    const clock = formatClock(splitAppointmentDateTime(a.appointment_datetime).minutes);
    return [
      a.reference_code,
      date,
      `${clock.time} ${clock.period}`,
      a.patient?.full_name,
      a.patient?.phone,
      a.doctor?.full_name,
      sourceLabel(a.source),
      a.booked_by?.full_name,
      STATUS_META[status].label,
      status === "cancelled" ? a.cancellation_reason : "",
      formatCreatedAt(a.created_at),
    ]
      .map(csvCell)
      .join(",");
  });
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/** Staff/doctor appointments workspace: today timeline, tabs, table and detail drawer. */
export function AppointmentsBoard() {
  const queryClient = useQueryClient();
  const { can } = usePermission();
  const canManage = can("appointments:manage");
  const canEdit = can("appointments:edit");
  const canBulkCancel = can("appointments:bulk_cancel");

  const nowMs = useMinuteClock();
  const now = nowMs === null ? null : istNow(nowMs);
  const today = now?.date ?? null;

  const [tab, setTab] = useState<AppointmentTab>("today");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<AppointmentFilterValues>({});
  // Snapshot of the opened appointment — it can drop out of the current tab
  // after an action (e.g. declined from "Needs approval"), so the drawer
  // can't rely on finding it in the list.
  const [picked, setPicked] = useState<ApiAppointment | null>(null);

  // Deep link from the Patients page: /appointments?appointment=<id>&patient=<id>.
  // Resolved through the patient's appointment list (appointments:view), so
  // every role that can see the list can open the link.
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkedId = searchParams.get("appointment");
  const linkedPatientId = searchParams.get("patient");
  const { data: linkedAppointment } = useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, "patient-history", linkedPatientId],
    queryFn: async () =>
      (await appointmentService.list({ patient_id: linkedPatientId as string })).data.appointments,
    enabled: Boolean(linkedId && linkedPatientId),
    select: (list) => list.find((a) => a.id === linkedId) ?? null,
  });
  const selected = picked ?? linkedAppointment ?? null;
  const setSelected = (next: ApiAppointment | null) => {
    setPicked(next);
    // Drop the link once the user moves on, or closing would reopen it.
    if (linkedId) router.replace("/appointments");
  };
  const [bookOpen, setBookOpen] = useState(false);
  const [confirmFor, setConfirmFor] = useState<ApiAppointment | null>(null);
  const [rescheduleFor, setRescheduleFor] = useState<ApiAppointment | null>(null);
  const [followUpFor, setFollowUpFor] = useState<ApiAppointment | null>(null);
  const [declineFor, setDeclineFor] = useState<{ appointment: ApiAppointment; mode: "decline" | "cancel" } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selection, setSelection] = useState<Selection>({ listKey: "", ids: new Set(), allMatching: false });
  const [bulkDialog, setBulkDialog] = useState<{ key: number; open: boolean }>({ key: 0, open: false });

  // In-flight guard per appointment: the ref blocks a double click before the
  // re-render lands, the state drives the disabled/spinner UI.
  const busyRef = useRef(new Set<string>());
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(new Set());

  // Doctor logins lack doctors:view (and only ever see their own appointments anyway).
  const { data: doctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => (await doctorService.list()).data.doctors,
    enabled: can("doctors:view"),
  });

  // Each tab is filtered server-side; the first page also carries every tab's count.
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const listParams = {
    tab,
    doctor_id: filters.doctorId,
    date: filters.date,
    search: debouncedSearch || undefined,
  };
  const listQuery = useInfiniteQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, "board", listParams],
    queryFn: async ({ pageParam }) =>
      (
        await appointmentService.list({
          ...listParams,
          include_counts: pageParam === 0,
          ...(PAGED_TABS.includes(listParams.tab) ? { limit: PAGE_SIZE, offset: pageParam } : {}),
        })
      ).data,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!PAGED_TABS.includes(listParams.tab)) return undefined;
      const loaded = allPages.reduce((n, page) => n + page.appointments.length, 0);
      return loaded < lastPage.count ? loaded : undefined;
    },
    // Keeps the counts (and dimmed rows) on screen while the next tab loads.
    placeholderData: keepPreviousData,
  });

  // On the plain Today tab the list *is* the timeline — no second request.
  const timelineSharesList = tab === "today" && !filters.date && !debouncedSearch;
  const timelineQuery = useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, "timeline", filters.doctorId ?? null],
    queryFn: async () =>
      (await appointmentService.list({ tab: "today", doctor_id: filters.doctorId })).data.appointments,
    enabled: !timelineSharesList,
  });

  const listAppointments = useMemo(
    () => listQuery.data?.pages.flatMap((page) => page.appointments) ?? [],
    [listQuery.data]
  );
  const counts = listQuery.data?.pages[0]?.counts ?? EMPTY_COUNTS;
  const timelineAppointments = useMemo(
    () => (timelineSharesList ? listAppointments : (timelineQuery.data ?? [])),
    [timelineSharesList, listAppointments, timelineQuery.data]
  );
  const matchingCount = listQuery.data?.pages[0]?.count ?? 0;
  const isLoading = listQuery.isLoading || today === null;
  const timelineLoading = (timelineSharesList ? listQuery.isLoading : timelineQuery.isLoading) || today === null;

  const rows = useMemo<Row[]>(
    () =>
      listAppointments.map((appointment) => ({
        appointment,
        status: getDisplayStatus(appointment),
        date: splitAppointmentDateTime(appointment.appointment_datetime).date,
      })),
    [listAppointments]
  );

  const bulkAvailable = canBulkCancel && BULK_CANCEL_TABS.includes(tab);
  const inSelectMode = selectMode && bulkAvailable;
  const listKey = JSON.stringify(listParams);
  const activeSelection =
    selection.listKey === listKey ? selection : { listKey, ids: new Set<string>(), allMatching: false };
  const selectableIds = rows.filter((r) => CANCELLABLE.includes(r.status)).map((r) => r.appointment.id);
  const allLoadedSelected =
    selectableIds.length > 0 && selectableIds.every((id) => activeSelection.ids.has(id));
  const selectedCount = activeSelection.allMatching ? matchingCount : activeSelection.ids.size;

  const toggleRow = (a: ApiAppointment) => {
    const ids = new Set(activeSelection.ids);
    if (ids.has(a.id)) ids.delete(a.id);
    else ids.add(a.id);
    setSelection({ listKey, ids, allMatching: false });
  };
  const toggleAllLoaded = () =>
    setSelection({ listKey, ids: allLoadedSelected ? new Set() : new Set(selectableIds), allMatching: false });
  const exitSelectMode = () => {
    setSelectMode(false);
    setSelection({ listKey: "", ids: new Set(), allMatching: false });
  };

  // Prefer the freshest copy from any loaded list; fall back to the snapshot.
  const drawerAppointment = useMemo(() => {
    if (!selected) return null;
    const fresh =
      listAppointments.find((a) => a.id === selected.id) ??
      timelineAppointments.find((a) => a.id === selected.id);
    return fresh ? mergeJoined(fresh, selected) : selected;
  }, [selected, listAppointments, timelineAppointments]);

  const setBusy = (id: string, busy: boolean) => {
    if (busy) busyRef.current.add(id);
    else busyRef.current.delete(id);
    setBusyIds(new Set(busyRef.current));
  };

  /** Runs one appointment action: no double submits, toast either way, then
   * refetch so the list, tab counts, timeline and drawer all update together. */
  const runAction = useCallback(
    async (
      appointment: ApiAppointment,
      request: () => Promise<{ data: { appointment: ApiAppointment } }>,
      successMessage: string
    ) => {
      if (busyRef.current.has(appointment.id)) return false;
      setBusy(appointment.id, true);
      try {
        const res = await request();
        toast.success(successMessage);
        const updated = res.data.appointment;
        // Follow-up returns the *new* appointment — only merge same-id results.
        // (A deep-linked drawer has no snapshot — it refreshes via the refetch below.)
        setPicked((prev) => (prev && updated?.id === prev.id ? mergeJoined(updated, prev) : prev));
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY }),
          // Patients page next-appointment / last-visit columns and stats.
          queryClient.invalidateQueries({ queryKey: ["patients"] }),
          // Bell: an approved/declined booking leaves "needs approval".
          queryClient.invalidateQueries({ queryKey: ["notifications"] }),
        ]);
        return true;
      } catch (err) {
        const e = err as NormalizedApiError;
        toast.error(e.error ?? "Something went wrong", e.msg);
        return false;
      } finally {
        setBusy(appointment.id, false);
      }
    },
    [queryClient]
  );

  const actions = {
    onOpen: (a: ApiAppointment) => setSelected(a),
    onApprove: (a: ApiAppointment) => runAction(a, () => appointmentService.confirm(a.id), "Appointment approved"),
    onDecline: (a: ApiAppointment) => setDeclineFor({ appointment: a, mode: "decline" }),
    onCancel: (a: ApiAppointment) => setDeclineFor({ appointment: a, mode: "cancel" }),
    onArrive: (a: ApiAppointment) => runAction(a, () => appointmentService.arrive(a.id), "Patient marked arrived"),
    onComplete: (a: ApiAppointment) => runAction(a, () => appointmentService.complete(a.id), "Appointment marked done"),
    onReschedule: (a: ApiAppointment) => setRescheduleFor(a),
    onFollowUp: (a: ApiAppointment) => setFollowUpFor(a),
  };

  const createAppointment = async (payload: CreateAppointmentPayload) => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const res = await appointmentService.create(payload);
      toast.success(res.msg);
      setBookOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ["patients"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      ]);
    } catch (err) {
      const e = err as NormalizedApiError;
      toast.error(e.error ?? "Something went wrong", e.msg);
    } finally {
      setIsCreating(false);
    }
  };

  const headerDate = today
    ? new Date(`${today}T00:00:00Z`).toLocaleDateString("en-GB", {
        timeZone: "UTC",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const emptyState = EMPTY_STATES[tab];

  return (
    // Bleeds over ErpShell's <main> padding so the page gets the mockup's tinted background.
    <div className="-m-4 min-h-full bg-[#F5F7F6] p-4 dark:bg-background sm:-m-5 sm:p-5 lg:-m-6 lg:p-6 xl:-m-8 xl:p-8">
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className={cn("text-3xl font-semibold tracking-tight", APPT_UI.ink)}>Appointments</h1>
            {headerDate ? (
              <p className="mt-1 text-sm text-muted-foreground">{headerDate}</p>
            ) : (
              <Skeleton className="mt-2 h-4 w-48" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 bg-card shadow-none"
              disabled={isLoading || rows.length === 0}
              title={listQuery.hasNextPage ? "Exports the rows loaded so far" : undefined}
              onClick={() => exportCsv(rows, `appointments-${tab}-${today ?? "export"}.csv`)}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Can module="appointments" action="create">
              <Button className={cn("gap-2", APPT_UI.primaryButton)} onClick={() => setBookOpen(true)}>
                <Plus className="h-4 w-4" />
                New appointment
              </Button>
            </Can>
          </div>
        </header>

        <DayTimeline
          appointments={timelineAppointments}
          nowMinutes={now?.minutes ?? null}
          isLoading={timelineLoading}
          onSelect={actions.onOpen}
        />

        {/* Tabs + search + filters */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <AppointmentTabs value={tab} onChange={setTab} counts={counts} />
          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-80 lg:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone or booking ID"
                aria-label="Search appointments"
                className="h-9 bg-card pl-9 shadow-none"
              />
            </div>
            <AppointmentFilters value={filters} onChange={setFilters} doctors={doctors} />
            {bulkAvailable && !inSelectMode && (
              <Button variant="outline" className="h-9 gap-2 bg-card shadow-none" onClick={() => setSelectMode(true)}>
                <ListChecks className="h-4 w-4" />
                Select
              </Button>
            )}
          </div>
        </div>

        {inSelectMode && (
          <div
            className={cn(
              APPT_UI.card,
              "flex flex-col gap-3 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between md:px-5"
            )}
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <label className="flex cursor-pointer items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer accent-emerald-700"
                  checked={activeSelection.allMatching || allLoadedSelected}
                  disabled={selectableIds.length === 0}
                  onChange={toggleAllLoaded}
                />
                Select all
              </label>
              <span className="text-muted-foreground">{selectedCount} selected</span>
              {allLoadedSelected && !activeSelection.allMatching && (
                <button
                  type="button"
                  className="font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-300"
                  onClick={() => setSelection({ listKey, ids: activeSelection.ids, allMatching: true })}
                >
                  Select all {matchingCount} matching this view
                </button>
              )}
              {activeSelection.allMatching && (
                <span className="text-muted-foreground">
                  (every cancellable appointment matching this tab, search and filters)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
                disabled={selectedCount === 0}
                onClick={() => setBulkDialog((d) => ({ key: d.key + 1, open: true }))}
              >
                <XCircle className="h-4 w-4" />
                Cancel selected
              </Button>
              <Button variant="ghost" size="sm" onClick={exitSelectMode}>
                Done
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <section className={cn(APPT_UI.card, "overflow-hidden")}>
          <div
            className={cn(
              "hidden border-b border-[#E3E9E5] bg-muted/30 px-5 py-3 text-xs font-medium text-muted-foreground dark:border-border",
              APPOINTMENT_ROW_GRID
            )}
          >
            <span>Time</span>
            <span>Patient</span>
            <span>Doctor</span>
            <span>Booked via</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {isLoading ? (
            <div>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className={cn("flex flex-col gap-3 border-b border-[#E3E9E5] px-5 py-4 last:border-b-0 dark:border-border", APPOINTMENT_ROW_GRID)}>
                  <Skeleton className="h-8 w-14" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-44" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-8 w-28 md:ml-auto" />
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              {tab === "cancelled" ? (
                <CalendarX className="h-9 w-9 text-muted-foreground/60" />
              ) : (
                <CalendarCheck className="h-9 w-9 text-muted-foreground/60" />
              )}
              <p className={cn("mt-3 font-medium", APPT_UI.ink)}>
                {debouncedSearch ? `No matches for “${debouncedSearch}”` : emptyState.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {debouncedSearch || filters.date ? "Try a different search or clear the filters." : emptyState.hint}
              </p>
            </div>
          ) : (
            <div
              aria-busy={listQuery.isPlaceholderData}
              className={cn("transition-opacity", listQuery.isPlaceholderData && "opacity-50")}
            >
              {rows.map(({ appointment, status }) => (
                <AppointmentRow
                  key={appointment.id}
                  appointment={appointment}
                  status={status}
                  todayYmd={today as string}
                  showDate={tab !== "today"}
                  busy={busyIds.has(appointment.id)}
                  canManage={canManage}
                  canEdit={canEdit}
                  selection={
                    inSelectMode
                      ? {
                          selected: activeSelection.allMatching
                            ? CANCELLABLE.includes(status)
                            : activeSelection.ids.has(appointment.id),
                          selectable: CANCELLABLE.includes(status) && !activeSelection.allMatching,
                          onToggle: toggleRow,
                        }
                      : undefined
                  }
                  {...actions}
                />
              ))}
              {listQuery.hasNextPage && (
                <div className="flex justify-center border-t border-[#E3E9E5] p-3 dark:border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={listQuery.isFetchingNextPage}
                    onClick={() => listQuery.fetchNextPage()}
                  >
                    {listQuery.isFetchingNextPage ? "Loading…" : "Load more"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {today && (
        <AppointmentDrawer
          appointment={drawerAppointment}
          onClose={() => setSelected(null)}
          todayYmd={today}
          busy={drawerAppointment ? busyIds.has(drawerAppointment.id) : false}
          {...actions}
          // The drawer's Approve keeps the existing "approve at a different time" option.
          onApprove={(a) => setConfirmFor(a)}
        />
      )}

      <BookAppointmentDialog
        key={bookOpen ? "open" : "closed"}
        open={bookOpen}
        onOpenChange={setBookOpen}
        isSubmitting={isCreating}
        onSubmit={createAppointment}
      />

      <ConfirmAppointmentDialog
        key={`confirm-${confirmFor?.id ?? "none"}`}
        open={Boolean(confirmFor)}
        onOpenChange={(open) => !open && setConfirmFor(null)}
        appointment={confirmFor}
        isSubmitting={confirmFor ? busyIds.has(confirmFor.id) : false}
        onSubmit={async (slotId) => {
          if (!confirmFor) return;
          const ok = await runAction(
            confirmFor,
            () => appointmentService.confirm(confirmFor.id, { slot_id: slotId }),
            "Appointment approved"
          );
          if (ok) setConfirmFor(null);
        }}
      />

      <DeclineDialog
        key={`decline-${declineFor?.appointment.id ?? "none"}`}
        open={Boolean(declineFor)}
        onOpenChange={(open) => !open && setDeclineFor(null)}
        appointment={declineFor?.appointment ?? null}
        mode={declineFor?.mode ?? "decline"}
        isSubmitting={declineFor ? busyIds.has(declineFor.appointment.id) : false}
        onSubmit={async (reason) => {
          if (!declineFor) return;
          const { appointment, mode } = declineFor;
          const ok = await runAction(
            appointment,
            () => appointmentService.cancel(appointment.id, reason),
            mode === "decline" ? "Appointment declined" : "Appointment cancelled"
          );
          if (ok) setDeclineFor(null);
        }}
      />

      <RescheduleDialog
        key={`reschedule-${rescheduleFor?.id ?? "none"}`}
        open={Boolean(rescheduleFor)}
        onOpenChange={(open) => !open && setRescheduleFor(null)}
        appointment={rescheduleFor}
        isSubmitting={rescheduleFor ? busyIds.has(rescheduleFor.id) : false}
        onSubmit={async (slotId) => {
          if (!rescheduleFor) return;
          const ok = await runAction(
            rescheduleFor,
            () => appointmentService.update(rescheduleFor.id, { slot_id: slotId }),
            "Appointment rescheduled"
          );
          if (ok) setRescheduleFor(null);
        }}
      />

      <BulkCancelDialog
        key={`bulk-cancel-${bulkDialog.key}`}
        open={bulkDialog.open}
        onOpenChange={(open) => setBulkDialog((d) => ({ ...d, open }))}
        count={selectedCount}
        selection={
          activeSelection.allMatching
            ? { filter: { tab, search: listParams.search, doctor_id: listParams.doctor_id, date: listParams.date } }
            : { appointmentIds: [...activeSelection.ids] }
        }
        onCancelled={() => {
          exitSelectMode();
          void Promise.all([
            queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY }),
            queryClient.invalidateQueries({ queryKey: ["patients"] }),
            queryClient.invalidateQueries({ queryKey: ["notifications"] }),
          ]);
        }}
      />

      <FollowUpDialog
        key={`followup-${followUpFor?.id ?? "none"}`}
        open={Boolean(followUpFor)}
        onOpenChange={(open) => !open && setFollowUpFor(null)}
        sourceAppointment={followUpFor}
        isSubmitting={followUpFor ? busyIds.has(followUpFor.id) : false}
        onSubmit={async (slotId) => {
          if (!followUpFor) return;
          const ok = await runAction(
            followUpFor,
            () => appointmentService.followUp(followUpFor.id, { slot_id: slotId }),
            "Next appointment booked and confirmed"
          );
          if (ok) setFollowUpFor(null);
        }}
      />
    </div>
  );
}
