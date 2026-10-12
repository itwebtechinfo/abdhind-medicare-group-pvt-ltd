"use client";

import { useState } from "react";
import { AlertTriangle, Check, Pencil } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";
import { friendlyDate, splitAppointmentDateTime, type ApiAppointment, type TreatmentActionPayload } from "./appointment";
import { APPT_UI } from "./StatusBadge";

const STATE_LABEL: Record<string, { text: string; tone: string }> = {
  complete: { text: "Treatment complete", tone: "bg-green-50 text-green-800 dark:bg-green-500/15 dark:text-green-300" },
  next_booked: { text: "Next sitting booked", tone: "bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300" },
  needs_next: { text: "Next sitting not booked", tone: "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" },
  stale: { text: "No visit in 90 days", tone: "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" },
  ongoing: { text: "In progress", tone: "bg-muted text-foreground" },
};

interface Props {
  a: ApiAppointment;
  todayYmd: string;
  canManage: boolean;
  busy: boolean;
  onAction: (a: ApiAppointment, payload: TreatmentActionPayload) => void;
  /** Opens the "Complete the treatment?" dialog (handles a booked later sitting). */
  onCompleteTreatment: (a: ApiAppointment) => void;
}

type Pending = { payload: TreatmentActionPayload; title: string; description: string; confirm: string } | null;

/** Drawer section for multi-sitting treatments (staff-only). Patients never see sittings. */
export function TreatmentSection({ a, todayYmd, canManage, busy, onAction, onCompleteTreatment }: Props) {
  const [editing, setEditing] = useState(false);
  const [planned, setPlanned] = useState(String(a.chain?.planned_sittings ?? ""));
  const [pending, setPending] = useState<Pending>(null);
  const chain = a.chain;
  const isUpcoming = ["PENDING", "APPROVED", "PATIENT_CONFIRMED"].includes(a.status);
  const singleFinal = !chain && a.status === "COMPLETED" && a.done_type === "final";

  // A single visit marked "Treatment complete" by mistake: one quiet link, no section.
  if (!chain && !a.can_join_chain && !a.chain_conflict) {
    if (!(singleFinal && canManage)) return null;
    return (
      <>
        <p className="text-xs text-muted-foreground">
          More sittings needed after all?{" "}
          <button type="button" className="font-medium text-[#1F7A4A] hover:underline dark:text-primary" disabled={busy}
                  onClick={() => setPending({ payload: { action: "reopen" }, title: "Continue as a treatment?",
                    description: "This visit becomes Sitting 1 and you can book the next sitting. A Google review request may already have gone out.",
                    confirm: "Continue as treatment" })}>
            Continue as a treatment
          </button>
        </p>
        <Confirm pending={pending} setPending={setPending} onConfirm={(p) => onAction(a, p)} />
      </>
    );
  }

  const state = chain ? STATE_LABEL[chain.state] ?? STATE_LABEL.ongoing : null;
  const isLastDone = chain?.last_sitting_id === a.id;
  return (
    <section className="rounded-xl border border-[#E3E9E5] p-4 text-sm dark:border-border">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className={cn("font-semibold", APPT_UI.ink)}>Treatment</h3>
        {state && <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", state.tone)}>{state.text}</span>}
      </div>

      {a.chain_conflict && (
        <p role="alert" className="mb-3 flex gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          This booking wasn&apos;t added to the patient&apos;s treatment because Sitting {a.chain_conflict.sitting_no} is already
          booked for {a.chain_conflict.appointment_datetime.replace("T", " ")} ({a.chain_conflict.reference_code}). Check whether
          it&apos;s a duplicate.
        </p>
      )}

      {chain && (
        <ol className="mb-3 space-y-1.5">
          {chain.timeline.map((t) => {
            const d = splitAppointmentDateTime(t.appointment_datetime).date;
            const what =
              t.status === "COMPLETED" ? (t.done_type === "final" ? "done · treatment complete" : "done")
                : t.status === "CANCELLED" ? "cancelled"
                  : t.no_show ? "no-show" : t.status === "PENDING" ? "awaiting approval" : "booked";
            return (
              <li key={t.id} className={cn("flex items-center gap-2", t.id === a.id && "font-semibold",
                t.status === "CANCELLED" && "text-muted-foreground line-through")}>
                <span className={cn("flex h-4 w-4 items-center justify-center rounded-full border",
                  t.status === "COMPLETED" ? "border-green-600 bg-green-600 text-white" : "border-muted-foreground/50")}>
                  {t.status === "COMPLETED" && <Check className="h-3 w-3" />}
                </span>
                Sitting {t.sitting_no} · {friendlyDate(d, todayYmd)} · {what}
              </li>
            );
          })}
        </ol>
      )}

      {chain && (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">Total sittings (estimate):</span>
          {editing ? (
            <>
              <Input aria-label="Total sittings" type="number" min={1} max={50} className="h-7 w-20" value={planned}
                     onChange={(e) => setPlanned(e.target.value)} />
              <Button size="sm" className="h-7" disabled={busy} onClick={() => {
                const n = planned.trim() === "" ? 0 : Math.max(0, Math.min(50, Math.round(Number(planned)) || 0));
                onAction(a, { action: "set_planned", planned_sittings: n });
                setEditing(false);
              }}>Save</Button>
              <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditing(false)}>Cancel</Button>
            </>
          ) : (
            <>
              <span className="font-medium">{chain.planned_sittings ?? "not set"}</span>
              {canManage && (
                <button type="button" aria-label="Edit total sittings" className="text-muted-foreground hover:text-foreground"
                        onClick={() => { setPlanned(String(chain.planned_sittings ?? "")); setEditing(true); }}>
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      )}

      {canManage && (
        <div className="flex flex-wrap gap-2">
          {chain && isLastDone && a.done_type === "sitting" && (chain.state === "needs_next" || chain.state === "stale" || chain.state === "next_booked") && (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => onCompleteTreatment(a)}>
              Mark treatment complete
            </Button>
          )}
          {chain && a.status === "COMPLETED" && a.done_type === "final" && (
            <Button size="sm" variant="outline" disabled={busy}
                    onClick={() => setPending({ payload: { action: "reopen" }, title: "Reopen the treatment?",
                      description: "Use this if “Treatment complete” was pressed by mistake, or the patient needs more sittings. A Google review request may already have gone out.",
                      confirm: "Reopen treatment" })}>
              Reopen treatment
            </Button>
          )}
          {chain && a.follow_up_of && isUpcoming && (
            <Button size="sm" variant="outline" disabled={busy}
                    onClick={() => setPending({ payload: { action: "unlink" }, title: "Make it a normal appointment?",
                      description: "For a visit about something else. It stops being a sitting of this treatment; the treatment will need its next sitting booked.",
                      confirm: "Make normal appointment" })}>
              Not part of this treatment
            </Button>
          )}
          {a.can_join_chain && (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction(a, { action: "join" })}>
              Add to treatment as next sitting
            </Button>
          )}
        </div>
      )}
      <Confirm pending={pending} setPending={setPending} onConfirm={(p) => onAction(a, p)} />
    </section>
  );
}

function Confirm({ pending, setPending, onConfirm }: {
  pending: Pending;
  setPending: (p: Pending) => void;
  onConfirm: (payload: TreatmentActionPayload) => void;
}) {
  return (
    <ConfirmDialog
      open={Boolean(pending)}
      onOpenChange={(open) => !open && setPending(null)}
      title={pending?.title ?? ""}
      description={pending?.description}
      confirmLabel={pending?.confirm}
      onConfirm={() => {
        if (pending) onConfirm(pending.payload);
        setPending(null);
      }}
    />
  );
}
