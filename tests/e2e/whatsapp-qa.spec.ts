import fs from "node:fs";
import path from "node:path";
import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import { API, QA_DIR, api, apiLogin, instrument, loadUsers, uiLogin, visit } from "./lib";

/**
 * Appointment + inbox actions that SEND REAL WHATSAPP MESSAGES, run only on
 * the QA patient (qa/test-users.local.md -> patient). Opt-in:
 *
 *   E2E_WHATSAPP=1 npx playwright test whatsapp-qa
 *
 * Every mutating browser request is checked against the QA appointment ids /
 * the QA phone; anything else (and every broadcast/template endpoint) is
 * aborted and fails the run.
 */

const USERS = loadUsers();
const QA = USERS.patient;
const QA_E164 = QA ? `+91${QA.phone}` : "";
const SHOTS = path.join(QA_DIR, "screenshots", "whatsapp");

test.describe.configure({ mode: "serial" });
test.skip(process.env.E2E_WHATSAPP !== "1", "sends real WhatsApp messages - set E2E_WHATSAPP=1");
test.skip(!QA, "no QA patient in qa/test-users.local.md");

const allowedAppointments = new Set<string>();
const violations: string[] = [];
const results: { step: string; api: string; whatsapp: string }[] = [];

let sysTok = "";
let recTok = "";
let doctorId = "";
let apptId = "";
let patientId = "";
let followUpId = "";

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const today = ymd(new Date());
const tomorrow = ymd(new Date(Date.now() + 86_400_000));

/** Abort any mutating request that isn't aimed at QA data. Registered after
 * instrument(), so it runs first and falls through to it when allowed. */
async function guard(page: Page) {
  await page.route(`${API}/**`, async (route) => {
    const req = route.request();
    const method = req.method();
    if (["GET", "HEAD", "OPTIONS"].includes(method)) return route.fallback();
    const url = new URL(req.url()).pathname.replace(/^\/api\/v1/, "");
    let ok = true;
    if (url === "/doctor/approve") {
      ok = allowedAppointments.has(String(req.postDataJSON()?.appointment_id));
    } else if (/^\/appointments\/[^/]+/.test(url)) {
      ok = allowedAppointments.has(url.split("/")[2]);
    } else if (url.startsWith("/whatsapp/conversations/")) {
      ok = decodeURIComponent(url.split("/")[3]).replace(/\D/g, "").endsWith(QA!.phone);
    } else if (url.startsWith("/whatsapp/") || url.startsWith("/doctor/")) {
      ok = false; // broadcast, templates, exit-human-mode...
    }
    if (ok) return route.fallback();
    violations.push(`${method} ${url}`);
    return route.abort();
  });
}

async function outboundIds(request: APIRequestContext) {
  const res = await api(request, recTok, "GET", `/whatsapp/conversations/${encodeURIComponent(QA_E164)}/messages`);
  return new Set<string>((res.body.data?.messages ?? []).map((m: { id: string }) => m.id));
}

/** New outbound messages to the QA number since `before`. */
async function newMessages(request: APIRequestContext, before: Set<string>) {
  await new Promise((r) => setTimeout(r, 1500));
  const res = await api(request, recTok, "GET", `/whatsapp/conversations/${encodeURIComponent(QA_E164)}/messages`);
  const fresh = (res.body.data?.messages ?? []).filter(
    (m: { id: string; direction: string; is_internal_note: boolean }) =>
      !before.has(m.id) && m.direction === "outbound" && !m.is_internal_note
  );
  return fresh.map(
    (m: { message_type: string; content: { template_name?: string; text?: string }; status: string; wa_message_id: string | null; error_reason: string | null }) =>
      `${m.message_type === "template" ? `template ${m.content.template_name}` : `text "${(m.content.text ?? "").slice(0, 40)}…"`} -> ${m.status}${m.wa_message_id ? " (wamid)" : ""}${m.error_reason ? ` [${m.error_reason}]` : ""}`
  ) as string[];
}

async function freeSlot(request: APIRequestContext, date: string, exclude: string[] = [], after = "00:00") {
  const res = await api(request, sysTok, "GET", `/doctors/${doctorId}/slots?date=${date}`);
  const slot = (res.body.data?.slots ?? []).find(
    (s: { is_booked: boolean; start_time: string; id?: string; _id?: string }) =>
      !s.is_booked && s.start_time > after && !exclude.includes(s.start_time)
  );
  expect(slot, `no free Dr. QA Doctor slot on ${date} after ${after}`).toBeTruthy();
  return { id: (slot.id ?? slot._id) as string, time: slot.start_time as string };
}

async function assertQaAppointment(request: APIRequestContext, id: string) {
  const appt = (await api(request, sysTok, "GET", `/appointments/${id}`)).body.data?.appointment;
  const patient = (await api(request, sysTok, "GET", `/patients/${appt?.patient_id}`)).body.data?.patient;
  expect(patient?.phone, `appointment ${id} must belong to the QA patient`).toBe(QA_E164);
}

async function openDrawer(page: Page, id: string) {
  await visit(page, `/appointments?appointment=${id}&patient=${patientId}`);
  await expect(page.getByRole("dialog").getByText(QA!.name).first()).toBeVisible();
}

async function step(
  page: Page,
  request: APIRequestContext,
  name: string,
  apiMatch: RegExp,
  act: () => Promise<void>
) {
  const before = await outboundIds(request);
  const [res] = await Promise.all([
    page.waitForResponse((r) => apiMatch.test(r.url()) && r.request().method() !== "GET", { timeout: 30_000 }),
    act(),
  ]);
  const body = await res.json().catch(() => ({}));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SHOTS, `${name.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}.png`) });
  const sent = await newMessages(request, before);
  results.push({ step: name, api: `${res.status()} ${body.msg ?? ""}`.trim(), whatsapp: sent.join("; ") || "none" });
  return { status: res.status(), body };
}

test.beforeAll(async ({ request }) => {
  fs.mkdirSync(SHOTS, { recursive: true });
  sysTok = await apiLogin(request, USERS.system_admin);
  recTok = await apiLogin(request, USERS.reception);
  const docs = await api(request, sysTok, "GET", "/doctors");
  const doc = docs.body.data.doctors.find((d: { full_name: string }) => d.full_name === "Dr. QA Doctor");
  doctorId = doc.id ?? doc._id;

  // The QA patient books for themselves (booking itself sends nothing).
  const now = new Date();
  const later = `${String(now.getHours() + 1).padStart(2, "0")}:00`;
  const slot = await freeSlot(request, today, [], later);
  const patientTok = await apiLogin(request, QA!);
  const created = await api(request, patientTok, "POST", "/appointments", {
    patient_phone: QA!.phone, patient_name: QA!.name, patient_age: 30, patient_gender: "Male",
    patient_address: "", doctor_id: doctorId, slot_id: slot.id,
  });
  expect(created.status, JSON.stringify(created.body)).toBe(201);
  apptId = created.body.data.appointment._id ?? created.body.data.appointment.id;
  patientId = String(created.body.data.appointment.patient_id);
  allowedAppointments.add(apptId);
  await assertQaAppointment(request, apptId);
  results.push({ step: `Patient books ${today} ${slot.time} (API)`, api: `${created.status}`, whatsapp: "none expected" });
});

test("reception: approve -> reschedule -> re-approve -> arrive -> done -> follow-up -> cancel follow-up", async ({ page, request }) => {
  await instrument(page);
  await guard(page);
  await uiLogin(page, USERS.reception);
  await page.waitForURL(/\/dashboard/);
  const dialog = page.getByRole("dialog");

  // 1. Approve -> appointment_approved
  await openDrawer(page, apptId);
  await dialog.getByRole("button", { name: "Approve", exact: true }).click();
  let r = await step(page, request, "Approve", /\/doctor\/approve$/, () =>
    page.getByRole("button", { name: "Confirm Appointment" }).click()
  );
  expect(r.status).toBe(200);

  // 2. Reschedule (same day, later slot) -> appointment_rescheduled, back to PENDING
  const current = (await api(request, recTok, "GET", `/appointments/${apptId}`)).body.data.appointment;
  const currentTime = String(current.appointment_datetime).slice(11, 16);
  const target = await freeSlot(request, today, [currentTime], currentTime);
  await openDrawer(page, apptId);
  await dialog.getByRole("button", { name: "Reschedule", exact: true }).click();
  const rs = page.getByRole("dialog", { name: "Reschedule Appointment" });
  await rs.locator("#reschedule-date").fill(today);
  await rs.getByRole("button", { name: target.time, exact: true }).click();
  r = await step(page, request, `Reschedule to ${target.time}`, new RegExp(`/appointments/${apptId}$`), () =>
    rs.getByRole("button", { name: "Confirm Reschedule" }).click()
  );
  expect(r.status).toBe(200);

  // 3. Re-approve (reschedule puts it back in "needs approval")
  await openDrawer(page, apptId);
  await dialog.getByRole("button", { name: "Approve", exact: true }).click();
  r = await step(page, request, "Re-approve after reschedule", /\/doctor\/approve$/, () =>
    page.getByRole("button", { name: "Confirm Appointment" }).click()
  );
  expect(r.status).toBe(200);

  // 4. Arrive + done (no WhatsApp expected)
  await openDrawer(page, apptId);
  r = await step(page, request, "Mark arrived", /\/arrive$/, () =>
    dialog.getByRole("button", { name: "Mark arrived" }).click()
  );
  expect(r.status).toBe(200);
  await openDrawer(page, apptId);
  r = await step(page, request, "Mark done", /\/complete$/, () =>
    dialog.getByRole("button", { name: "Mark done" }).click()
  );
  expect(r.status).toBe(200);

  // 5. Follow-up tomorrow -> follow_up_scheduled
  const fu = await freeSlot(request, tomorrow);
  await openDrawer(page, apptId);
  await dialog.getByRole("button", { name: "Book follow-up" }).click();
  const fd = page.getByRole("dialog", { name: "Book Follow-up" });
  await fd.locator("#followup-date").fill(tomorrow);
  await fd.getByRole("button", { name: fu.time, exact: true }).click();
  r = await step(page, request, `Book follow-up ${tomorrow} ${fu.time}`, /\/follow-up$/, () =>
    fd.getByRole("button", { name: "Confirm Follow-up" }).click()
  );
  expect(r.status).toBe(201);
  const fuAppt = r.body.data?.appointment ?? r.body.data?.follow_up;
  followUpId = String(fuAppt?._id ?? fuAppt?.id);
  allowedAppointments.add(followUpId);
  await assertQaAppointment(request, followUpId);

  // 6. Decline the follow-up (it starts as "needs approval"; cancel sends nothing today)
  await openDrawer(page, followUpId);
  await dialog.getByRole("button", { name: "Decline", exact: true }).click();
  const cd = page.getByRole("dialog", { name: "Decline appointment" });
  await cd.locator("#decline-reason").selectOption("Duplicate booking");
  r = await step(page, request, "Decline follow-up", new RegExp(`/appointments/${followUpId}/cancel$`), () =>
    cd.getByRole("button", { name: "Decline appointment" }).click()
  );
  expect(r.status).toBe(200);
  expect(violations, "requests aimed at non-QA data").toEqual([]);
});

test("reception: inbox deep link, window-closed state, retry, take over / release", async ({ page, request }) => {
  await instrument(page);
  await guard(page);
  await uiLogin(page, USERS.reception);
  await page.waitForURL(/\/dashboard/);
  await visit(page, `/whatsapp?phone=${encodeURIComponent(QA_E164)}`);
  await expect(page.getByText(QA_E164.replace("+", "")).or(page.getByText(QA_E164)).or(page.getByText(QA!.name)).first()).toBeVisible();
  const closed = await page.getByPlaceholder("24-hour window closed").isVisible().catch(() => false);
  results.push({ step: "Inbox ?phone= deep link", api: "-", whatsapp: closed ? "composer disabled: 24h window closed" : "window open" });
  await page.screenshot({ path: path.join(SHOTS, "inbox_deeplink.png") });

  const retry = page.getByRole("button", { name: "Retry" }).first();
  if (await retry.isVisible().catch(() => false)) {
    await step(page, request, "Retry failed message", /\/retry$/, () => retry.click());
  }
  const takeOver = page.getByRole("button", { name: "Take Over" });
  if (await takeOver.isVisible().catch(() => false)) {
    await step(page, request, "Take over", /\/takeover$/, () => takeOver.click());
  }
  await step(page, request, "Release to bot", /\/release$/, () => page.getByRole("button", { name: "Release to Bot" }).click());
  expect(violations, "requests aimed at non-QA data").toEqual([]);
});

test("patient: sees own appointments", async ({ page }) => {
  await instrument(page);
  await guard(page);
  await uiLogin(page, QA!);
  await page.waitForURL((u) => !u.pathname.startsWith("/login"));
  await visit(page, "/appointments");
  await expect(page.getByText("Dr. QA Doctor").first()).toBeVisible();
  await page.screenshot({ path: path.join(SHOTS, "patient_appointments.png") });
  results.push({ step: "Patient opens /appointments", api: "-", whatsapp: "-" });
});

test.afterAll(() => {
  const rows = results.map((r) => `| ${r.step} | ${r.api.replace(/\|/g, "/")} | ${r.whatsapp.replace(/\|/g, "/")} |`);
  fs.writeFileSync(
    path.join(QA_DIR, "whatsapp-qa.md"),
    `# WhatsApp actions on QA data\n\nGenerated ${new Date().toISOString()} — QA patient ${QA_E164}, appointment ${apptId}, follow-up ${followUpId}\n\n| step | API | WhatsApp to QA number |\n|---|---|---|\n${rows.join("\n")}\n\nBlocked non-QA requests: ${violations.length ? violations.join(", ") : "none"}\n`
  );
});
