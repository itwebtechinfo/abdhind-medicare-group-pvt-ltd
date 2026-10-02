"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Search, UserPlus, Users } from "lucide-react";
import { Can } from "@/src/components/rbac/PermissionGate";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useMinuteClock } from "@/src/hooks/useMinuteClock";
import { usePermission } from "@/src/hooks/usePermission";
import { languageLabel } from "@/src/lib/format";
import { toast } from "@/src/lib/toast";
import { cn } from "@/src/lib/utils";
import type { NormalizedApiError } from "@/src/types/api";
import {
  appointmentService,
  formatClock,
  formatCreatedAt,
  istNow,
  splitAppointmentDateTime,
  type BookAppointmentFormValues,
  type CreateAppointmentPayload,
} from "@/src/features/appointments/appointment";
import { BookAppointmentDialog } from "@/src/features/appointments/BookAppointmentDialog";
import { APPT_UI } from "@/src/features/appointments/StatusBadge";
import {
  formatPatientPhone,
  patientService,
  type ApiPatient,
  type CreatePatientFormValues,
  type PatientListRow,
  type PatientTab,
  type UpdatePatientPayload,
} from "./patient";
import { PatientDrawer } from "./PatientDrawer";
import { PatientFormDialog } from "./PatientFormDialog";
import { PatientHistoryDialog } from "./PatientHistoryDialog";
import { PATIENT_ROW_GRID, PatientRow } from "./PatientRow";
import { PatientTabs } from "./PatientTabs";

const PATIENTS_QUERY_KEY = ["patients"] as const;
const PAGE_SIZE = 50;

const EMPTY_STATES: Record<PatientTab, { title: string; hint: string }> = {
  all: { title: "No patients yet", hint: "Registered patients will show up here." },
  upcoming_visit: { title: "No patients with an upcoming visit", hint: "Patients with a booked appointment appear here." },
  new_this_week: { title: "No new patients this week", hint: "Registrations since Monday appear here." },
  missed_last_visit: { title: "No missed visits", hint: "Nobody to follow up with right now." },
};

const GENDERS = ["Male", "Female", "Other"] as const;

function appointmentHref(appointmentId: string, patientId: string): string {
  return `/appointments?appointment=${encodeURIComponent(appointmentId)}&patient=${encodeURIComponent(patientId)}`;
}

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function exportCsv(rows: PatientListRow[], fileName: string) {
  const header = ["UHID", "Name", "Phone", "Age", "Gender", "Address", "WhatsApp language", "Registered", "Last visit", "Missed", "Next appointment", "Next status"];
  const lines = rows.map((p) => {
    const { last_visit, missed, next_appointment } = p.visit_summary;
    const next = next_appointment ? splitAppointmentDateTime(next_appointment.appointment_datetime) : null;
    const clock = next ? formatClock(next.minutes) : null;
    return [
      p.uhid,
      p.full_name,
      formatPatientPhone(p.phone),
      p.age,
      p.gender,
      p.address,
      p.preferred_language ? languageLabel(p.preferred_language) : "",
      formatCreatedAt(p.created_at),
      last_visit ? `${last_visit.appointment_datetime.slice(0, 10)} (${last_visit.kind})` : "",
      missed ? missed.appointment_datetime.slice(0, 10) : "",
      next && clock ? `${next.date} ${clock.time} ${clock.period}` : "",
      next_appointment?.status ?? "",
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

/** Staff patients workspace: stats, server-side tabs/search/pagination, table and drawer. */
export function PatientsBoard() {
  const queryClient = useQueryClient();
  const { can } = usePermission();

  const nowMs = useMinuteClock();
  const today = nowMs === null ? null : istNow(nowMs).date;

  const [tab, setTab] = useState<PatientTab>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const searchRef = useRef<HTMLInputElement>(null);

  const [selected, setSelected] = useState<PatientListRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<ApiPatient | null>(null);
  const [historyPatientId, setHistoryPatientId] = useState<string | null>(null);
  const [bookFor, setBookFor] = useState<PatientListRow | null>(null);

  // "/" focuses the search box (unless the user is already typing somewhere).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Counts come from the DB (GET /patients/stats), never from loaded rows.
  const { data: stats } = useQuery({
    queryKey: [...PATIENTS_QUERY_KEY, "stats"],
    queryFn: async () => (await patientService.stats()).data,
  });

  const listParams = { tab, search: debouncedSearch || undefined };
  const listQuery = useInfiniteQuery({
    queryKey: [...PATIENTS_QUERY_KEY, "board", listParams],
    queryFn: async ({ pageParam }) =>
      (await patientService.listPage({ ...listParams, limit: PAGE_SIZE, offset: pageParam })).data,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((n, page) => n + page.patients.length, 0);
      return loaded < lastPage.count ? loaded : undefined;
    },
    placeholderData: keepPreviousData,
  });

  const rows = useMemo(() => listQuery.data?.pages.flatMap((page) => page.patients) ?? [], [listQuery.data]);
  const isLoading = listQuery.isLoading || today === null;

  // Prefer the freshest copy of the open patient after a refetch.
  const drawerPatient = useMemo(
    () => (selected ? (rows.find((r) => r.id === selected.id) ?? selected) : null),
    [rows, selected]
  );

  const invalidatePatients = () => queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (values: CreatePatientFormValues) =>
      patientService.create({
        full_name: values.full_name,
        phone: values.phone,
        age: Number(values.age),
        gender: values.gender,
        address: values.address,
      }),
    onSuccess: (res) => {
      toast.success(res.msg);
      setFormOpen(false);
      invalidatePatients();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UpdatePatientPayload }) => patientService.update(id, changes),
    onSuccess: (res) => {
      toast.success(res.msg);
      setFormOpen(false);
      setEditingPatient(null);
      invalidatePatients();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const bookMutation = useMutation({
    mutationFn: (payload: CreateAppointmentPayload) => appointmentService.create(payload),
    onSuccess: (res) => {
      toast.success(res.msg);
      setBookFor(null);
      // A new booking changes the next-appointment column and the stats.
      invalidatePatients();
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const openEdit = (p: ApiPatient) => {
    setEditingPatient(p);
    setFormOpen(true);
  };

  const bookInitialValues = (p: PatientListRow): Partial<BookAppointmentFormValues> => ({
    patient_phone: p.phone.replace(/\D/g, "").slice(-10),
    patient_name: p.full_name,
    patient_age: p.age != null ? String(p.age) : "",
    patient_gender: GENDERS.find((g) => g.toLowerCase() === (p.gender ?? "").toLowerCase()) ?? "",
    patient_address: p.address ?? "",
  });

  const emptyState = EMPTY_STATES[tab];
  const subtitle = stats
    ? `${stats.total} registered patient${stats.total === 1 ? "" : "s"}, ${stats.new_this_week} new this week`
    : null;

  return (
    // Bleeds over ErpShell's <main> padding for the tinted page background (same as Appointments).
    <div className="-m-4 min-h-full bg-[#F5F7F6] p-4 dark:bg-background sm:-m-5 sm:p-5 lg:-m-6 lg:p-6 xl:-m-8 xl:p-8">
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className={cn("text-3xl font-semibold tracking-tight", APPT_UI.ink)}>Patients</h1>
            {subtitle ? (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            ) : (
              <Skeleton className="mt-2 h-4 w-56" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 bg-card shadow-none"
              disabled={isLoading || rows.length === 0}
              title={listQuery.hasNextPage ? "Exports the rows loaded so far" : undefined}
              onClick={() => exportCsv(rows, `patients-${tab}-${today ?? "export"}.csv`)}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Can module="patients" action="create">
              <Button
                className={cn("gap-2", APPT_UI.primaryButton)}
                onClick={() => {
                  setEditingPatient(null);
                  setFormOpen(true);
                }}
              >
                <UserPlus className="h-4 w-4" />
                Add patient
              </Button>
            </Can>
          </div>
        </header>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a phone number, name or UHID"
              aria-label="Search patients"
              className="h-12 rounded-xl border-[#1F7A4A]/40 bg-card pl-12 pr-12 text-base shadow-none focus-visible:ring-[#1F7A4A]/30 dark:border-border"
            />
            <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded border border-[#E3E9E5] px-1.5 text-xs text-muted-foreground dark:border-border sm:block">
              /
            </kbd>
          </div>
          <PatientTabs value={tab} onChange={setTab} stats={stats} />
        </div>

        <section className={cn(APPT_UI.card, "overflow-hidden")}>
          <div
            className={cn(
              "hidden border-b border-[#E3E9E5] bg-muted/30 px-5 py-3 text-xs font-medium text-muted-foreground dark:border-border",
              PATIENT_ROW_GRID
            )}
          >
            <span>Patient</span>
            <span>Contact</span>
            <span>Area</span>
            <span>Last visit</span>
            <span>Next appointment</span>
            <span className="text-right">Actions</span>
          </div>

          {isLoading ? (
            <div>
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className={cn("flex flex-col gap-3 border-b border-[#E3E9E5] px-5 py-4 last:border-b-0 dark:border-border", PATIENT_ROW_GRID)}
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-8 w-32 md:ml-auto" />
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <Users className="h-9 w-9 text-muted-foreground/60" />
              <p className={cn("mt-3 font-medium", APPT_UI.ink)}>
                {debouncedSearch ? `No patients match “${debouncedSearch}”` : emptyState.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {debouncedSearch ? "Try a phone number, part of a name, or a UHID." : emptyState.hint}
              </p>
            </div>
          ) : (
            <div
              aria-busy={listQuery.isPlaceholderData}
              className={cn("transition-opacity", listQuery.isPlaceholderData && "opacity-50")}
            >
              {rows.map((p) => (
                <PatientRow
                  key={p.id}
                  patient={p}
                  todayYmd={today as string}
                  canBook={can("appointments:create")}
                  canEdit={can("patients:edit")}
                  canWhatsApp={can("whatsapp_inbox:view")}
                  onOpen={setSelected}
                  onBook={setBookFor}
                  onEdit={openEdit}
                  onHistory={(row) => setHistoryPatientId(row.id)}
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
        <PatientDrawer
          patient={drawerPatient}
          todayYmd={today}
          onClose={() => setSelected(null)}
          onBook={setBookFor}
          onEdit={openEdit}
          onHistory={(p) => setHistoryPatientId(p.id)}
          appointmentHref={appointmentHref}
        />
      )}

      <PatientFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingPatient(null);
        }}
        patient={editingPatient}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onCreate={(values) => createMutation.mutate(values)}
        onUpdate={(id, changes) => updateMutation.mutate({ id, changes })}
      />

      <PatientHistoryDialog
        open={Boolean(historyPatientId)}
        onOpenChange={(open) => !open && setHistoryPatientId(null)}
        patientId={historyPatientId}
      />

      {bookFor && (
        <BookAppointmentDialog
          key={`book-${bookFor.id}`}
          open
          onOpenChange={(open) => !open && setBookFor(null)}
          isSubmitting={bookMutation.isPending}
          onSubmit={(payload) => bookMutation.mutate(payload)}
          initialValues={bookInitialValues(bookFor)}
        />
      )}
    </div>
  );
}
