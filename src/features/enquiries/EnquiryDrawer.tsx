"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2, Phone, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { usePermission } from "@/src/hooks/usePermission";
import { cn } from "@/src/lib/utils";
import { CLINIC_TIME_ZONE, formatCreatedAt } from "@/src/features/appointments/appointment";
import { avatarColor, initials } from "@/src/features/appointments/AppointmentRow";
import { APPT_UI } from "@/src/features/appointments/StatusBadge";
import { formatPatientPhone, patientPhoneE164 } from "@/src/features/patients/patient";
import type { ApiEnquiry, EnquiryStatus } from "./enquiry";
import { ENQUIRY_STATUS_META, EnquiryStatusBadge } from "./EnquiryStatusBadge";

interface EnquiryDrawerProps {
  enquiry: ApiEnquiry | null;
  busy: boolean;
  onClose: () => void;
  onSetStatus: (e: ApiEnquiry, status: EnquiryStatus) => void;
  onAddNote: (e: ApiEnquiry, note: string) => Promise<boolean>;
  onBook: (e: ApiEnquiry) => void;
}

function formatEpoch(ms: number): string {
  return new Date(ms).toLocaleString("en-GB", {
    timeZone: CLINIC_TIME_ZONE,
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Right-side panel (full-screen on mobile). Closes on ×, Esc or backdrop click. */
export function EnquiryDrawer({ enquiry, onClose, ...rest }: EnquiryDrawerProps) {
  return (
    <DialogPrimitive.Root open={Boolean(enquiry)} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-card text-card-foreground shadow-2xl focus:outline-none sm:max-w-[480px] sm:border-l sm:border-[#E3E9E5] sm:dark:border-border"
        >
          {enquiry && <DrawerBody key={enquiry._id} enquiry={enquiry} {...rest} />}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function DrawerBody({ enquiry: e, busy, onSetStatus, onAddNote, onBook }: Omit<EnquiryDrawerProps, "enquiry" | "onClose"> & { enquiry: ApiEnquiry }) {
  const { can } = usePermission();
  const canManage = can("enquiry:manage");
  const [note, setNote] = useState("");
  const tel = patientPhoneE164(e.phone);

  const details: { label: string; value: React.ReactNode }[] = [
    {
      label: "Phone",
      value: tel ? (
        <a href={`tel:${tel}`} className="inline-flex items-center gap-1.5 hover:underline">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          {formatPatientPhone(e.phone)}
        </a>
      ) : (
        formatPatientPhone(e.phone)
      ),
    },
    { label: "Preferred time", value: e.preferred_time ?? "Any time" },
    { label: "Received", value: formatCreatedAt(e.created_at) },
    { label: "Source", value: e.source === "website" ? "Website quick enquiry" : e.source },
    {
      label: "Patient record",
      value: e.patient ? `${e.patient.full_name} · ${e.patient.uhid}` : "Not registered yet",
    },
  ];
  if (e.status_changed_at && e.status_changed_by) {
    details.push({
      label: `Marked ${ENQUIRY_STATUS_META[e.status].label.toLowerCase()}`,
      value: `${formatEpoch(e.status_changed_at)}${e.status_changed_by.name ? ` by ${e.status_changed_by.name}` : ""}`,
    });
  }

  return (
    <>
      <div className="border-b border-[#E3E9E5] px-5 pb-5 pt-5 dark:border-border sm:px-6">
        <div className="flex items-start gap-4">
          <span aria-hidden className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-semibold", avatarColor(e._id))}>
            {initials(e.full_name)}
          </span>
          <div className="min-w-0 flex-1">
            <DialogPrimitive.Title className={cn("truncate text-xl font-semibold tracking-tight", APPT_UI.ink)}>
              {e.full_name}
            </DialogPrimitive.Title>
            <EnquiryStatusBadge status={e.status} className="mt-1.5" />
          </div>
          <DialogPrimitive.Close className="-mr-1 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
        <dl className="grid grid-cols-[minmax(120px,auto)_1fr] gap-x-6 gap-y-3 text-sm">
          {details.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className={cn("min-w-0 break-words font-medium", APPT_UI.ink)}>{row.value}</dd>
            </div>
          ))}
        </dl>

        {e.message && (
          <section>
            <h3 className={cn("mb-2 text-sm font-semibold", APPT_UI.ink)}>Message</h3>
            <p className="whitespace-pre-wrap rounded-xl bg-muted/50 px-4 py-3 text-sm">{e.message}</p>
          </section>
        )}

        <section>
          <h3 className={cn("mb-3 text-sm font-semibold", APPT_UI.ink)}>Call notes</h3>
          {e.notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          ) : (
            <ol className="space-y-3">
              {[...e.notes].reverse().map((n, i) => (
                <li key={i} className="rounded-xl border border-[#E3E9E5] px-4 py-3 text-sm dark:border-border">
                  <p className={cn("whitespace-pre-wrap", APPT_UI.ink)}>{n.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatEpoch(n.at)}
                    {n.by?.name ? ` · ${n.by.name}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          )}
          {canManage && (
            <form
              className="mt-3 space-y-2"
              onSubmit={async (ev) => {
                ev.preventDefault();
                if (note.trim() && (await onAddNote(e, note.trim()))) setNote("");
              }}
            >
              <Textarea
                rows={2}
                maxLength={1000}
                placeholder="e.g. Called, wants an evening slot on Friday"
                value={note}
                onChange={(ev) => setNote(ev.target.value)}
                aria-label="Add a call note"
              />
              <Button type="submit" size="sm" variant="outline" className="shadow-none" disabled={busy || !note.trim()}>
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Add note
              </Button>
            </form>
          )}
        </section>
      </div>

      {canManage && (
        <div className="flex flex-wrap gap-2 border-t border-[#E3E9E5] bg-card px-5 py-4 dark:border-border sm:px-6">
          {e.status === "NEW" && (
            <Button variant="outline" className="flex-1 shadow-none" disabled={busy} onClick={() => onSetStatus(e, "CONTACTED")}>
              Mark contacted
            </Button>
          )}
          {(e.status === "NEW" || e.status === "CONTACTED") && (
            <>
              <Button variant="outline" className="flex-1 shadow-none" disabled={busy} onClick={() => onSetStatus(e, "CLOSED")}>
                Close
              </Button>
              {can("appointments:create") && (
                <Button className={cn("flex-1", APPT_UI.primaryButton)} disabled={busy} onClick={() => onBook(e)}>
                  Book appointment
                </Button>
              )}
            </>
          )}
          {(e.status === "CONVERTED" || e.status === "CLOSED") && (
            <Button variant="outline" className="flex-1 shadow-none" disabled={busy} onClick={() => onSetStatus(e, "NEW")}>
              Reopen
            </Button>
          )}
        </div>
      )}
    </>
  );
}
