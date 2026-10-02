"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, MoreVertical, Phone, Search } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { usePermission } from "@/src/hooks/usePermission";
import { toast } from "@/src/lib/toast";
import { cn } from "@/src/lib/utils";
import type { NormalizedApiError } from "@/src/types/api";
import { appointmentService, formatCreatedAt, type CreateAppointmentPayload } from "@/src/features/appointments/appointment";
import { avatarColor, initials } from "@/src/features/appointments/AppointmentRow";
import { BookAppointmentDialog } from "@/src/features/appointments/BookAppointmentDialog";
import { APPT_UI } from "@/src/features/appointments/StatusBadge";
import { formatPatientPhone, patientPhoneE164 } from "@/src/features/patients/patient";
import { ENQUIRY_STATUSES, enquiryService, type ApiEnquiry, type EnquiryCounts, type EnquiryStatus } from "./enquiry";
import { EnquiryDrawer } from "./EnquiryDrawer";
import { ENQUIRY_STATUS_META, EnquiryStatusBadge } from "./EnquiryStatusBadge";

const ENQUIRIES_QUERY_KEY = ["enquiries"] as const;
const PAGE_SIZE = 50;

type EnquiryTab = EnquiryStatus | "ALL";
const TABS: EnquiryTab[] = [...ENQUIRY_STATUSES, "ALL"];

const ROW_GRID =
  "md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_120px_220px] md:items-center md:gap-4";

const EMPTY_STATES: Record<EnquiryTab, string> = {
  NEW: "No new enquiries — you're all caught up.",
  CONTACTED: "No enquiries waiting after a call.",
  CONVERTED: "No enquiries converted to bookings yet.",
  CLOSED: "No closed enquiries.",
  ALL: "No enquiries yet. Website callback requests will show up here.",
};

/** Staff inbox for website "Quick Enquiry" callback requests. */
export function EnquiriesBoard() {
  const queryClient = useQueryClient();
  const { can } = usePermission();
  const canManage = can("enquiry:manage");
  const canBook = can("appointments:create");

  const [tab, setTab] = useState<EnquiryTab>("NEW");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const [picked, setPicked] = useState<ApiEnquiry | null>(null);

  // Deep link from the notification bell: /enquiries?enquiry=<id>.
  const router = useRouter();
  const linkedId = useSearchParams().get("enquiry");
  const { data: linkedEnquiry } = useQuery({
    queryKey: [...ENQUIRIES_QUERY_KEY, "detail", linkedId],
    queryFn: async () => (await enquiryService.get(linkedId as string)).data.enquiry,
    enabled: Boolean(linkedId),
  });
  const selected = picked ?? linkedEnquiry ?? null;
  const setSelected = (next: ApiEnquiry | null) => {
    setPicked(next);
    // Drop the link once the user moves on, or closing would reopen it.
    if (linkedId) router.replace("/enquiries");
  };
  const [bookFor, setBookFor] = useState<ApiEnquiry | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const busyRef = useRef(new Set<string>());
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(new Set());
  const setBusy = (id: string, busy: boolean) => {
    if (busy) busyRef.current.add(id);
    else busyRef.current.delete(id);
    setBusyIds(new Set(busyRef.current));
  };

  const listParams = { status: tab === "ALL" ? undefined : tab, search: debouncedSearch || undefined };
  const listQuery = useInfiniteQuery({
    queryKey: [...ENQUIRIES_QUERY_KEY, listParams],
    queryFn: async ({ pageParam }) => (await enquiryService.list({ ...listParams, limit: PAGE_SIZE, offset: pageParam })).data,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((n, page) => n + page.enquiries.length, 0);
      return loaded < lastPage.count ? loaded : undefined;
    },
    placeholderData: keepPreviousData,
  });

  const rows = useMemo(() => listQuery.data?.pages.flatMap((page) => page.enquiries) ?? [], [listQuery.data]);
  const counts: EnquiryCounts | undefined = listQuery.data?.pages[0]?.counts;
  const drawerEnquiry = useMemo(
    () => (selected ? (rows.find((r) => r._id === selected._id) ?? selected) : null),
    [rows, selected]
  );

  /** One guarded update: no double submits, toast either way, then refetch. */
  const update = async (e: ApiEnquiry, payload: { status?: EnquiryStatus; note?: string }, success: string) => {
    if (busyRef.current.has(e._id)) return false;
    setBusy(e._id, true);
    try {
      const res = await enquiryService.update(e._id, payload);
      toast.success(success);
      setPicked((prev) => (prev && prev._id === e._id ? { ...res.data.enquiry, patient: prev.patient } : prev));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ENQUIRIES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      ]);
      return true;
    } catch (err) {
      const error = err as NormalizedApiError;
      toast.error(error.error ?? "Something went wrong", error.msg);
      return false;
    } finally {
      setBusy(e._id, false);
    }
  };

  const setStatus = (e: ApiEnquiry, status: EnquiryStatus) =>
    update(e, { status }, `Marked ${ENQUIRY_STATUS_META[status].label.toLowerCase()}`);

  const bookAppointment = async (payload: CreateAppointmentPayload) => {
    if (!bookFor || isBooking) return;
    setIsBooking(true);
    try {
      const res = await appointmentService.create(payload);
      toast.success(res.msg);
      const enquiry = bookFor;
      setBookFor(null);
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      const ref = res.data.appointment.reference_code;
      await update(
        enquiry,
        { status: "CONVERTED", note: `Appointment booked${ref ? ` (${ref})` : ""}.` },
        "Enquiry marked converted"
      );
    } catch (err) {
      const error = err as NormalizedApiError;
      toast.error(error.error ?? "Something went wrong", error.msg);
    } finally {
      setIsBooking(false);
    }
  };

  const newCount = counts?.NEW;

  return (
    // Bleeds over ErpShell's <main> padding for the tinted page background (same as Appointments).
    <div className="-m-4 min-h-full bg-[#F5F7F6] p-4 dark:bg-background sm:-m-5 sm:p-5 lg:-m-6 lg:p-6 xl:-m-8 xl:p-8">
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        <header>
          <h1 className={cn("text-3xl font-semibold tracking-tight", APPT_UI.ink)}>Enquiries</h1>
          {newCount === undefined ? (
            <Skeleton className="mt-2 h-4 w-56" />
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              {newCount === 0
                ? "No callback requests waiting"
                : `${newCount} callback request${newCount === 1 ? "" : "s"} waiting for a call`}
            </p>
          )}
        </header>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="tablist"
            aria-label="Enquiry status"
            className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-[#E3E9E5] bg-card p-1 dark:border-border"
          >
            {TABS.map((t) => {
              const active = t === tab;
              const count = t === "ALL" ? undefined : counts?.[t];
              return (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-[#17261F] text-white dark:bg-foreground dark:text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {t === "ALL" ? "All" : ENQUIRY_STATUS_META[t].label}
                  {count !== undefined && (
                    <span
                      className={cn(
                        "min-w-5 rounded-full px-1.5 text-center text-xs tabular-nums",
                        active
                          ? "bg-white/20 text-white dark:bg-background/20 dark:text-background"
                          : t === "NEW" && count > 0
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="relative lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(ev) => setSearch(ev.target.value)}
              placeholder="Search by name or phone"
              aria-label="Search enquiries"
              className="h-9 bg-card pl-9 shadow-none"
            />
          </div>
        </div>

        <section className={cn(APPT_UI.card, "overflow-hidden")}>
          <div
            className={cn(
              "hidden border-b border-[#E3E9E5] bg-muted/30 px-5 py-3 text-xs font-medium text-muted-foreground dark:border-border",
              ROW_GRID
            )}
          >
            <span>Name</span>
            <span>Phone</span>
            <span>Preferred time</span>
            <span>Received</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {listQuery.isLoading ? (
            <div>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className={cn("flex flex-col gap-3 border-b border-[#E3E9E5] px-5 py-4 last:border-b-0 dark:border-border", ROW_GRID)}>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-8 w-36 md:ml-auto" />
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <MessageSquare className="h-9 w-9 text-muted-foreground/60" />
              <p className={cn("mt-3 font-medium", APPT_UI.ink)}>
                {debouncedSearch ? `No enquiries match “${debouncedSearch}”` : EMPTY_STATES[tab]}
              </p>
            </div>
          ) : (
            <div aria-busy={listQuery.isPlaceholderData} className={cn("transition-opacity", listQuery.isPlaceholderData && "opacity-50")}>
              {rows.map((e) => {
                const tel = patientPhoneE164(e.phone);
                const busy = busyIds.has(e._id);
                const open = e.status === "NEW" || e.status === "CONTACTED";
                return (
                  <div
                    key={e._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelected(e)}
                    onKeyDown={(ev) => {
                      if (ev.target === ev.currentTarget && (ev.key === "Enter" || ev.key === " ")) {
                        ev.preventDefault();
                        setSelected(e);
                      }
                    }}
                    className={cn(
                      "flex cursor-pointer flex-col gap-3 border-b border-[#E3E9E5] px-4 py-3.5 text-sm transition-colors last:border-b-0 hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none dark:border-border md:px-5",
                      ROW_GRID,
                      e.status === "NEW" && "bg-amber-50/60 hover:bg-amber-50 dark:bg-amber-500/5 dark:hover:bg-amber-500/10"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span aria-hidden className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold", avatarColor(e._id))}>
                        {initials(e.full_name)}
                      </span>
                      <div className="min-w-0">
                        <p className={cn("truncate font-semibold", APPT_UI.ink)}>{e.full_name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {e.patient ? `Existing patient · ${e.patient.uhid}` : "New contact"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:contents">
                      <p className={cn("truncate tabular-nums", APPT_UI.ink)}>{formatPatientPhone(e.phone)}</p>
                      <p className="truncate text-muted-foreground">{e.preferred_time ?? "Any time"}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 md:contents">
                      <p className="truncate text-muted-foreground">{formatCreatedAt(e.created_at)}</p>
                      <div>
                        <EnquiryStatusBadge status={e.status} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 md:justify-end" onClick={(ev) => ev.stopPropagation()}>
                      {canManage && e.status === "NEW" ? (
                        <Button size="sm" variant="outline" className="h-8 shadow-none" disabled={busy} onClick={() => setStatus(e, "CONTACTED")}>
                          Mark contacted
                        </Button>
                      ) : canManage && canBook && e.status === "CONTACTED" ? (
                        <Button size="sm" className={cn("h-8", APPT_UI.primaryButton)} disabled={busy} onClick={() => setBookFor(e)}>
                          Book appointment
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-8" onClick={() => setSelected(e)}>
                          View
                        </Button>
                      )}
                      {tel && (
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" title={`Call ${e.full_name}`}>
                          <a href={`tel:${tel}`}>
                            <Phone className="h-4 w-4" />
                            <span className="sr-only">Call {e.full_name}</span>
                          </a>
                        </Button>
                      )}
                      {canManage && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" disabled={busy} onKeyDown={(ev) => ev.stopPropagation()}>
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">More actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => setSelected(e)}>View details</DropdownMenuItem>
                            {open && canBook && <DropdownMenuItem onSelect={() => setBookFor(e)}>Book appointment</DropdownMenuItem>}
                            {open && <DropdownMenuItem onSelect={() => setStatus(e, "CLOSED")}>Close</DropdownMenuItem>}
                            {!open && <DropdownMenuItem onSelect={() => setStatus(e, "NEW")}>Reopen</DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}
              {listQuery.hasNextPage && (
                <div className="flex justify-center border-t border-[#E3E9E5] p-3 dark:border-border">
                  <Button variant="ghost" size="sm" disabled={listQuery.isFetchingNextPage} onClick={() => listQuery.fetchNextPage()}>
                    {listQuery.isFetchingNextPage ? "Loading…" : "Load more"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <EnquiryDrawer
        enquiry={drawerEnquiry}
        busy={drawerEnquiry ? busyIds.has(drawerEnquiry._id) : false}
        onClose={() => setSelected(null)}
        onSetStatus={setStatus}
        onAddNote={(e, note) => update(e, { note }, "Note added")}
        onBook={setBookFor}
      />

      {bookFor && (
        <BookAppointmentDialog
          key={`book-${bookFor._id}`}
          open
          onOpenChange={(o) => !o && setBookFor(null)}
          isSubmitting={isBooking}
          onSubmit={bookAppointment}
          initialValues={{ patient_phone: bookFor.phone.replace(/\D/g, "").slice(-10), patient_name: bookFor.full_name }}
        />
      )}
    </div>
  );
}
