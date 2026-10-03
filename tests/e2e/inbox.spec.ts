/**
 * WhatsApp inbox, end to end. LOCAL ONLY - see playwright.inbox.config.ts.
 * Nothing here reaches Meta or a phone: the backend talks to the mock Meta
 * server, whose call log is how "never sent" is asserted.
 *
 * Run: npm run test:e2e:inbox
 */
import fs from "node:fs";
import path from "node:path";
import { expect, request as playwrightRequest, test, type APIRequestContext, type Page } from "@playwright/test";
import { API, QA_DIR, loadUsers } from "./lib";
import {
  apiToken, cid, enc, fixtures, inboxApi, loginAs, metaId, mockCalls, mockFail, mockReset, mockSends,
  runBackendScript, sayText, sendMedia, tapButton,
} from "./inbox-helpers";

const USERS = loadUsers();
const RECEPTION = USERS.reception;
const ADMIN = USERS.admin;

// Conversation cast (fake E2E numbers only)
const SHABINA = 2;  // linked patient "Shabina Begum" (fixture), escalated to staff
const MERAJ = 3;    // unknown number, bot handles it
const LAIQ = 4;     // escalated, unassigned
const MEDIA = 9;    // sends a photo + PDF
const STOPPER = 8;  // sends STOP
const LINKER = 6;   // gets linked to an existing patient
const DUP = 7;      // has a wrong-format twin for the merge dry run
const BULK_FROM = 10, BULK_TO = 44; // 35 bot chats -> "Load more"

let fx: { doctor_id: string; patient_id: string; lab_order_id: string; tomorrow: string; patient_phone: string };
let api: APIRequestContext;

test.describe.configure({ mode: "serial" });

async function openInbox(page: Page, chat?: number) {
  await page.goto(chat ? `/whatsapp?c=${enc(cid(chat))}` : "/whatsapp");
  await expect(page.getByRole("heading", { name: "Conversations" })).toBeVisible();
  if (chat) await expect(page.getByTestId("chat-name")).toBeVisible();
}

function row(page: Page, n: number) {
  return page.locator(`[data-testid="conversation-row"][data-id="${cid(n)}"]`);
}

test.beforeAll(async () => {
  api = await playwrightRequest.newContext();
  fx = fixtures("reset");
  await mockReset(api);
  // 35 bot chats first, so the named cast below is newest in "Bot is handling".
  for (let n = BULK_FROM; n <= BULK_TO; n++) await sayText(api, metaId(n), `ping ${n}`, `Bulk ${n}`);
  // Shabina: asks, gets escalated by the bot, sends a voice note, then the latest text.
  await sayText(api, metaId(SHABINA), "Assalamu alaikum, mujhe kal ka appointment chahiye Dr. Ekhlaq ke saath", "Shabina");
  await tapButton(api, metaId(SHABINA), "Talk to staff", "Shabina");
  await sendMedia(api, metaId(SHABINA), "voice", "Shabina");
  await sayText(api, metaId(SHABINA), "Shaam 5 baje ke baad ho jaye to accha", "Shabina");
  // Laiq: escalated a bit later -> second in "Waiting", oldest first.
  await sayText(api, metaId(LAIQ), "Clinic kitne baje tak khula hai?", "Laiq Ahmed");
  await tapButton(api, metaId(LAIQ), "Talk to staff", "Laiq Ahmed");
  await sayText(api, metaId(MERAJ), "Hi", "merajalam1567");
});

test.afterAll(async () => {
  await api.dispose();
});

// ------------------------------------------------------------------ list
test("list: groups, counts, waiting time, scopes, search, load more", async ({ page }) => {
  await loginAs(page, RECEPTION);
  await openInbox(page);
  const waiting = page.locator('section[data-group="waiting"]');
  await expect(waiting.getByTestId("conversation-row").first()).toHaveAttribute("data-id", cid(SHABINA));
  await expect(waiting.locator(`[data-id="${cid(LAIQ)}"]`)).toBeVisible();
  await expect(row(page, SHABINA).getByTestId("waiting-time")).toHaveText(/\d+m/);
  await expect(row(page, SHABINA)).toContainText("Shabina Begum");      // patient record name
  await expect(row(page, SHABINA)).toContainText("Shaam 5 baje");        // patient's text, not the bot ack
  await expect(row(page, LAIQ)).toContainText("Laiq Ahmed");
  await expect(row(page, SHABINA)).toContainText("Unassigned");
  await expect(row(page, MERAJ)).toContainText("merajalam1567");          // profile name for unknown numbers
  await expect(page.locator('section[data-group="waiting"]')).toContainText("Waiting for reply · 2");
  await expect(page.locator('section[data-group="snoozed"]')).toContainText("Snoozed · 0");
  await expect(page.locator('section[data-group="done"]')).toContainText("Done today · 0");

  // Load more in "Bot is handling" (35 seeded + Meraj > one page of 30).
  const bot = page.locator('section[data-group="bot"]');
  const before = await bot.getByTestId("conversation-row").count();
  await bot.getByRole("button", { name: "Load more" }).click();
  await expect.poll(() => bot.getByTestId("conversation-row").count()).toBeGreaterThan(before);

  // Scopes: Team = human-mode chats only; Mine = none yet.
  await page.getByRole("tab", { name: /^Team/ }).click();
  await expect(page.getByTestId("conversation-row")).toHaveCount(2);
  await page.getByRole("tab", { name: /^Mine/ }).click();
  await expect(page.getByRole("tab", { name: /^Mine · 0/ })).toBeVisible();
  await page.getByRole("tab", { name: /^All/ }).click();

  // Search: name, phone in any format, message text.
  const search = page.getByLabel("Search conversations");
  for (const q of ["shabina", "99900 00004", "+91 9990000003", "khula"]) {
    await search.fill(q);
    await expect(page.getByRole("region", { name: "Search results" }).getByTestId("conversation-row").first()).toBeVisible();
  }
  await search.fill("khula");
  await expect(page.getByTestId("conversation-row")).toHaveCount(1);
  await expect(row(page, LAIQ)).toBeVisible();
  await search.fill("");
  await page.screenshot({ path: path.join(QA_DIR, "screenshots", "inbox", "list.png") });
});

// ------------------------------------------------------------------ chat
test("chat: open, date divider, bubbles, voice note, bot escalation chip", async ({ page }) => {
  await loginAs(page, RECEPTION);
  await openInbox(page, SHABINA);
  await expect(page.getByTestId("chat-name")).toHaveText("Shabina Begum");
  await expect(page.getByTestId("chat-panel")).toContainText("+91 99900 00002");
  await expect(page.getByTestId("date-divider").first()).toHaveText("Today");
  await expect(page.getByTestId("mode-banner")).toHaveAttribute("data-mode", "human");
  await expect(page.getByTestId("system-event").filter({ hasText: "Bot moved this chat to staff" })).toBeVisible();
  await expect(page.locator('[data-dir="inbound"]').filter({ hasText: "Assalamu alaikum" })).toBeVisible();
  // Bot bubbles carry the bot label.
  await expect(page.locator('[data-dir="outbound"]').filter({ hasText: "Bot" }).first()).toBeVisible();
  const voice = page.getByTestId("voice-player");
  await expect(voice).toBeVisible();
  await voice.getByRole("button", { name: "Play voice note" }).click();
  await expect.poll(async () => voice.getByTestId("voice-time").textContent(), { timeout: 10_000 }).not.toBe("0:00");
  await voice.getByRole("button", { name: /Playback speed 1x/ }).click();
  await expect(voice.getByRole("button", { name: /Playback speed 1.5x/ })).toBeVisible();
  await page.screenshot({ path: path.join(QA_DIR, "screenshots", "inbox", "chat.png") });
});

test("media: image lightbox and PDF card", async ({ page }) => {
  await sendMedia(api, metaId(MEDIA), "image", "Media Person");
  await sendMedia(api, metaId(MEDIA), "pdf", "Media Person");
  await loginAs(page, RECEPTION);
  await openInbox(page, MEDIA);
  await page.getByTestId("image-thumb").click();
  await expect(page.getByTestId("lightbox")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByTestId("lightbox")).toBeHidden();
  const card = page.getByTestId("document-card");
  await expect(card).toContainText("Old prescription.pdf");
  const href = await card.getByRole("link", { name: /Open Old prescription/ }).getAttribute("href");
  const res = await api.get(href!);
  expect(res.status()).toBe(200);
  expect((await res.body()).subarray(0, 4).toString()).toBe("%PDF");
  // Unsigned media URL is refused.
  expect((await (await api.get(href!.split("&exp=")[0])).json()).status).toBe(404);
});

// ------------------------------------------------------- modes + replies
test("Reply myself / Hand back to bot", async ({ page }) => {
  await loginAs(page, RECEPTION);
  await openInbox(page, MERAJ);
  const banner = page.getByTestId("mode-banner");
  await expect(banner).toHaveAttribute("data-mode", "bot");
  await expect(banner).toContainText("Bot is replying");
  await banner.getByRole("button", { name: "Reply myself" }).click();
  await expect(banner).toHaveAttribute("data-mode", "human");
  await expect(banner).toContainText("You are chatting. Bot is paused for merajalam1567");
  await expect(page.getByTestId("system-event").filter({ hasText: "took over" })).toBeVisible();
  await banner.getByRole("button", { name: "Hand back to bot" }).click();
  await expect(banner).toHaveAttribute("data-mode", "bot");
  await expect.poll(async () => (await mockSends(api, cid(MERAJ))).map((s) => JSON.stringify(s.body)).join(" "))
    .toContain("Staff se aapki baat ho gayi");
});

test("first reply auto-assigns, optimistic Sending… then ticks, Enter vs Shift+Enter", async ({ page }) => {
  await loginAs(page, RECEPTION);
  await openInbox(page, LAIQ);
  await expect(page.getByTestId("assignee-button")).toContainText("Unassigned");
  const box = page.getByRole("textbox", { name: "Reply", exact: true });
  await box.fill("Walaikum assalam.");
  await box.press("Shift+Enter");
  await box.pressSequentially("Clinic 8 baje tak khula hai.");
  await expect(box).toHaveValue("Walaikum assalam.\nClinic 8 baje tak khula hai.");
  await box.press("Enter");
  const bubble = page.locator('[data-dir="outbound"]').filter({ hasText: "Clinic 8 baje tak khula hai." });
  await expect(bubble).toBeVisible();
  await expect(bubble.getByTestId("status-sent")).toBeVisible();
  await expect(page.getByTestId("assignee-button")).toContainText("QA Reception");
  await expect(page.getByTestId("mode-banner")).toContainText("You are chatting");
  await expect(page.getByTestId("system-event").filter({ hasText: "Assigned to QA Reception" })).toBeVisible();
  const sends = await mockSends(api, cid(LAIQ));
  expect(sends.at(-1)!.body).toMatchObject({ type: "text", text: { body: "Walaikum assalam.\nClinic 8 baje tak khula hai." } });
  // It left "Waiting" (staff replied) and moved to "In progress".
  await expect(page.locator('section[data-group="in_progress"]').locator(`[data-id="${cid(LAIQ)}"]`)).toBeVisible();
});

test("assignee change from the header", async ({ page }) => {
  await loginAs(page, RECEPTION);
  await openInbox(page, LAIQ);
  await page.getByTestId("assignee-button").click();
  await page.getByRole("menuitem", { name: "QA Admin" }).click();
  await expect(page.getByTestId("assignee-button")).toContainText("QA Admin");
  await expect(page.getByTestId("system-event").filter({ hasText: "Assigned to QA Admin by QA Reception" })).toBeVisible();
  // Reception can't take it back now that it's someone else's (admin can).
  const token = await apiToken(api, RECEPTION);
  const res = await inboxApi(api, token, "POST", `/inbox/conversations/${enc(cid(LAIQ))}/actions`, { type: "assign", user_id: null });
  expect(res.status).toBe(403);
});

// ---------------------------------------------------------- snooze / done
test("snooze returns on its own; done -> Done today; patient writing reopens", async ({ page }) => {
  const token = await apiToken(api, ADMIN);
  await loginAs(page, ADMIN);
  await openInbox(page);
  // A short snooze through the same action the menu uses (menu presets are >= 1h).
  const until = Date.now() + 25_000;
  expect((await inboxApi(api, token, "POST", `/inbox/conversations/${enc(cid(SHABINA))}/actions`, { type: "snooze", until })).status).toBe(200);
  const snoozed = page.locator('section[data-group="snoozed"]');
  await expect(snoozed).toContainText("Snoozed · 1", { timeout: 20_000 });
  await snoozed.getByRole("button", { name: /Snoozed/ }).click();
  await expect(snoozed.locator(`[data-id="${cid(SHABINA)}"]`)).toBeVisible();
  // No cron: it simply belongs to "Waiting" again once the time has passed.
  await expect(page.locator('section[data-group="waiting"]').locator(`[data-id="${cid(SHABINA)}"]`)).toBeVisible({ timeout: 60_000 });

  // Snooze from the header menu (preset) to check the UI path.
  await openInbox(page, MERAJ);
  await page.getByRole("button", { name: "Snooze", exact: true }).click();
  await page.getByRole("menuitem", { name: "1 hour" }).click();
  await expect(page.getByTestId("system-event").filter({ hasText: "Snoozed by QA Admin" })).toBeVisible();
  await page.getByRole("button", { name: "Snooze", exact: true }).click();
  await page.getByRole("menuitem", { name: "Remove snooze" }).click();

  // Done -> Done today, then the patient writes again -> reopened.
  await openInbox(page, MERAJ);
  await page.getByRole("button", { name: "Mark as done" }).click();
  const done = page.locator('section[data-group="done"]');
  await expect(done).toContainText("Done today · 1");
  await sayText(api, metaId(MERAJ), "Ek aur sawaal hai", "merajalam1567");
  await expect(done).toContainText("Done today · 0", { timeout: 25_000 });
  await expect(page.getByTestId("system-event").filter({ hasText: "Reopened" })).toBeVisible({ timeout: 25_000 });
});

// ------------------------------------------------------- notes + mention
test("internal note is never sent; @mention notifies the colleague with a deep link", async ({ page, browser }) => {
  await loginAs(page, RECEPTION);
  await openInbox(page, SHABINA);
  const callsBefore = (await mockCalls(api)).length;
  await page.getByRole("tab", { name: "Internal note" }).click();
  await expect(page.getByTestId("composer")).toHaveAttribute("data-mode", "note");
  const note = page.getByRole("textbox", { name: "Internal note", exact: true });
  await note.pressSequentially("@QA Ad");
  await page.getByRole("listbox", { name: "Mention" }).getByRole("button", { name: /QA Admin/ }).click();
  await note.pressSequentially("pichhli baar RCT ke baad dard tha, is baar 30 min ka slot rakhein.");
  await note.press("Enter");
  const bubble = page.getByTestId("internal-note").filter({ hasText: "pichhli baar RCT" });
  await expect(bubble).toContainText("Internal note · QA Reception · only staff can see");
  await expect(bubble.locator("strong")).toHaveText("@QA Admin");
  await page.waitForTimeout(1500);
  expect((await mockCalls(api)).length, "a note must not cause ANY call to WhatsApp").toBe(callsBefore);

  const admin = await browser.newPage();
  await loginAs(admin, ADMIN);
  await admin.goto("/dashboard");
  await admin.getByRole("button", { name: /Notifications/ }).click();
  const item = admin.getByText("QA Reception mentioned you");
  await expect(item).toBeVisible();
  await item.click();
  await expect(admin).toHaveURL(new RegExp(`/whatsapp\\?c=${enc(cid(SHABINA)).replace("+", "\\+")}`));
  await expect(admin.getByTestId("chat-name")).toHaveText("Shabina Begum");
  await admin.close();
});

// ---------------------------------------------------- quick + saved replies
test("quick replies, saved replies CRUD, Slots", async ({ page }) => {
  // Start from an unset Timings chip (an earlier run may have filled it in).
  const token = await apiToken(api, RECEPTION);
  const saved = (await inboxApi(api, token, "GET", "/inbox/saved-replies")).body.data.items as { id: string; key: string | null; title: string }[];
  const timingsId = saved.find((r) => r.key === "timings")!.id;
  await inboxApi(api, token, "PATCH", `/inbox/saved-replies/${timingsId}`, { text: "" });
  for (const r of saved.filter((x) => x.title === "Parking")) await inboxApi(api, token, "DELETE", `/inbox/saved-replies/${r.id}`);
  await loginAs(page, RECEPTION);
  await openInbox(page, LAIQ);
  const box = page.getByRole("textbox", { name: "Reply", exact: true });
  await page.getByRole("button", { name: /Address/ }).click();
  await expect(box).toHaveValue(/887, Jama Masjid/);
  await box.fill("");
  // Timings starts unset -> opens the editor instead of inserting nothing.
  const timings = page.getByRole("button", { name: /Timings/ });
  await timings.click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Reply text").fill("🕘 Clinic timings: 10 AM - 8 PM, Monday to Saturday");
  await dialog.getByRole("button", { name: "Save" }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Timings/ }).click();
  await expect(box).toHaveValue(/10 AM - 8 PM/);
  await box.fill("");
  // New saved reply, insert it, delete it.
  await page.getByRole("button", { name: "Saved reply" }).click();
  await dialog.getByRole("button", { name: "Add saved reply" }).click();
  await dialog.getByLabel("Title").fill("Parking");
  await dialog.getByLabel("Reply text").fill("Parking is behind the masjid.");
  await dialog.getByRole("button", { name: "Save" }).click();
  await dialog.getByRole("button", { name: /Parking/ }).first().click();
  await expect(box).toHaveValue("Parking is behind the masjid.");
  await box.fill("");
  await page.getByRole("button", { name: "Saved reply" }).click();
  await dialog.getByRole("button", { name: "Delete Parking" }).click();
  await expect(dialog.getByText("Parking is behind the masjid.")).toBeHidden();
  await page.keyboard.press("Escape");
  // Slots inserts the next open slots.
  await page.getByRole("button", { name: "Slots" }).click();
  await expect(box).toHaveValue(/Available slots with/);
  await box.fill("");
});

test("template picker: variables, preview, rendered bubble", async ({ page }) => {
  await loginAs(page, RECEPTION);
  await openInbox(page, LAIQ);
  await page.getByRole("button", { name: "Template", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: /^appointment_approved/ }).first().click();
  await dialog.getByLabel("Variable 1").fill("Laiq Ahmed");
  await dialog.getByLabel("Variable 2").fill("Mon, 05 Oct, 10:00");
  await dialog.getByLabel("Variable 3").fill("MRD-E2E-1");
  await expect(dialog.getByTestId("template-preview")).toContainText("Laiq Ahmed");
  await dialog.getByRole("button", { name: "Send template" }).click();
  const bubble = page.getByTestId("template-message").last();
  await expect(bubble).toContainText("Template · appointment_approved");
  await expect(bubble).toContainText("MRD-E2E-1");
  await expect(bubble).not.toContainText("[template:");
  const sends = await mockSends(api, cid(LAIQ));
  expect(sends.at(-1)!.body).toMatchObject({ type: "template", template: { name: "appointment_approved" } });
  // List preview shows the rendered text too.
  await expect(row(page, LAIQ)).toContainText("Laiq Ahmed");
});

test("24h window: free text blocked after the window (UI + backend), template still works", async ({ page }) => {
  fixtures("age-window", cid(LAIQ), "25");
  const token = await apiToken(api, RECEPTION);
  const res = await api.fetch(`${API}/api/v1/inbox/conversations/${enc(cid(LAIQ))}/messages`, {
    method: "POST",
    multipart: { client_id: "e2ewindowclosed01", kind: "text", text: "late" },
    headers: { Authorization: `Bearer ${token}`, "x-forwarded-for": "10.0.0.9" },
  });
  expect(res.status()).toBe(409);
  expect((await res.json()).data.code).toBe("window_closed");

  await loginAs(page, RECEPTION);
  await openInbox(page, LAIQ);
  await expect(page.getByTestId("reply-window")).toHaveText("Reply window closed");
  await expect(page.getByRole("textbox", { name: "Reply", exact: true })).toBeHidden();
  await page.getByRole("button", { name: "Send a template" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: /^appointment_approved/ }).first().click();
  for (const [i, v] of ["Laiq", "Tue 10 AM", "MRD-E2E-2"].entries()) await dialog.getByLabel(`Variable ${i + 1}`).fill(v);
  await dialog.getByRole("button", { name: "Send template" }).click();
  await expect(page.getByTestId("template-message").last()).toContainText("MRD-E2E-2");
  // Re-open the window for the next tests (patient writes again).
  await sayText(api, metaId(LAIQ), "theek hai", "Laiq Ahmed");
});

test("send failure -> Retry, never sent twice (idempotency)", async ({ page }) => {
  await loginAs(page, RECEPTION);
  await openInbox(page, LAIQ);
  await expect(page.getByTestId("reply-window")).toContainText("left");
  await mockFail(api, true);
  const box = page.getByRole("textbox", { name: "Reply", exact: true });
  await box.fill("Retry test message");
  await box.press("Enter");
  const bubble = page.locator('[data-dir="outbound"]').filter({ hasText: "Retry test message" });
  await expect(bubble.getByTestId("status-failed")).toBeVisible();
  await mockFail(api, false);
  const okBefore = (await mockSends(api, cid(LAIQ))).length;
  await bubble.getByRole("button", { name: "Retry" }).click();
  await expect(bubble.getByTestId("status-sent")).toBeVisible();
  await page.waitForTimeout(1000);
  const delivered = (await mockSends(api, cid(LAIQ))).slice(okBefore).filter((s) => JSON.stringify(s.body).includes("Retry test message"));
  expect(delivered).toHaveLength(1);
  await expect(bubble).toHaveCount(1);
});

// -------------------------------------------------------------- presence
test("presence: two staff on the same chat see each other", async ({ browser }) => {
  const a = await browser.newPage();
  const b = await browser.newPage();
  await loginAs(a, RECEPTION);
  await loginAs(b, ADMIN);
  await openInbox(a, SHABINA);
  await openInbox(b, SHABINA);
  await expect(a.getByTestId("presence")).toContainText("QA Admin is also viewing", { timeout: 25_000 });
  await expect(b.getByTestId("presence")).toContainText("QA Reception is also viewing", { timeout: 25_000 });
  await a.close();
  await b.close();
});

// --------------------------------------------------------- patient panel
test("patient panel: quick book + confirmation, send report, view patient", async ({ page }) => {
  await loginAs(page, RECEPTION);
  await openInbox(page, SHABINA);
  const panel = page.getByTestId("patient-panel");
  await expect(panel).toContainText("Shabina Begum");
  await expect(panel).toContainText("42 · Female · E2E-0002");
  await expect(panel.getByTestId("visit-counts")).toHaveText("1 completed, 0 missed");
  await panel.getByLabel("Doctor").selectOption({ label: "Dr. E2E Inbox" });
  await panel.getByRole("button", { name: "5:30" }).click();
  await panel.getByRole("button", { name: "Book 5:30 PM & send confirmation" }).click();
  await expect(page.getByTestId("system-event").filter({ hasText: "Appointment booked" })).toBeVisible();
  await expect(panel).not.toContainText("None booked");
  await expect.poll(async () => JSON.stringify((await mockSends(api, cid(SHABINA))).at(-1)?.body)).toContain("Appointment Approved");

  await panel.getByRole("button", { name: "Send report" }).click();
  await page.getByRole("dialog").getByRole("button", { name: /X-ray report/ }).click();
  await expect(page.getByTestId("document-card").last()).toContainText("X-ray report");
  await expect(panel.getByTestId("activity")).toContainText("X-ray report sent on WhatsApp");
  expect((await mockSends(api, cid(SHABINA))).at(-1)!.body).toMatchObject({ type: "document" });

  await panel.getByRole("link", { name: "View patient" }).click();
  await expect(page).toHaveURL(/\/patients\?open=E2E-0002/);
  await expect(page.getByRole("dialog")).toContainText("Shabina Begum");
});

test("unknown number: Create patient (pre-filled) and Link to existing patient", async ({ page }) => {
  await sayText(api, metaId(LINKER), "Mera beta ka appointment", "Linker Phone");
  await loginAs(page, RECEPTION);
  await openInbox(page, MERAJ);
  const panel = page.getByTestId("patient-panel");
  await expect(panel.getByTestId("unknown-number")).toContainText("merajalam1567");
  await panel.getByRole("button", { name: "Create patient" }).click();
  const form = page.getByRole("dialog");
  await expect(form.locator('input[name="phone"]')).toHaveValue("9990000003");
  await expect(form.locator('input[name="full_name"]')).toHaveValue("merajalam1567");
  await form.locator('input[name="full_name"]').fill("Meraj Alam");
  await form.locator('input[name="age"]').fill("31");
  await form.locator('select[name="gender"]').selectOption({ index: 1 });
  await form.getByRole("button", { name: "Register Patient" }).click();
  await expect(panel).toContainText("Meraj Alam");

  await openInbox(page, LINKER);
  await page.getByTestId("patient-panel").getByRole("button", { name: "Link to existing patient" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Search patients").fill("Shabina");
  await dialog.getByRole("button", { name: /Shabina Begum/ }).click();
  await expect(page.getByTestId("patient-panel")).toContainText("E2E-0002");
  await expect(page.getByTestId("system-event").filter({ hasText: "Linked to patient Shabina Begum" })).toBeVisible();
});

// ------------------------------------------------------------- bot fixes
test("Continue after appointment_approved -> confirmation + menu (not 'samajh nahi aaya')", async () => {
  const token = await apiToken(api, RECEPTION);
  await inboxApi(api, token, "POST", `/inbox/conversations/${enc(cid(SHABINA))}/actions`, { type: "hand_back" });
  const before = (await mockSends(api, cid(SHABINA))).length;
  await tapButton(api, metaId(SHABINA), "Continue", "Shabina");
  const replies = (await mockSends(api, cid(SHABINA))).slice(before);
  const all = JSON.stringify(replies);
  expect(all).not.toContain("samajh nahi aaya");
  expect(replies.at(-1)!.body).toMatchObject({ type: "interactive", interactive: { header: { text: "✅ Appointment Confirmed" } } });
});

test("STOP opts out: banner, templates disabled", async ({ page }) => {
  await sayText(api, metaId(STOPPER), "STOP", "Stopper");
  await loginAs(page, RECEPTION);
  await openInbox(page, STOPPER);
  await expect(page.getByTestId("optout-banner")).toBeVisible();
  await expect(page.getByRole("button", { name: "Template", exact: true })).toBeDisabled();
  await expect(row(page, STOPPER)).toContainText("STOP");
});

test("duplicate-merge script: dry run lists the wrong-format twin and writes nothing", async () => {
  const planted = fixtures<{ wrong: string; canonical: string }>("duplicate", cid(DUP));
  await sayText(api, metaId(DUP), "hello", "Dup");
  const out = runBackendScript("scripts/merge_duplicate_conversations.py");
  expect(out).toContain("DRY RUN");
  expect(out).toContain(`${planted.wrong} -> ${planted.canonical}`);
  const again = runBackendScript("scripts/merge_duplicate_conversations.py");
  expect(again).toContain(`${planted.wrong} -> ${planted.canonical}`); // still there: nothing was written
});

// ---------------------------------------------------------- error states
test("errors: list, chat and patient panel show 'Couldn't load' + Retry instead of an endless skeleton", async ({ page }) => {
  await loginAs(page, RECEPTION);
  const listUrl = /\/api\/v1\/inbox\/conversations\?/;
  const chatUrl = new RegExp(`/api/v1/inbox/conversations/${enc(cid(SHABINA)).replace("+", "\\+")}$`);
  const slotsUrl = /\/api\/v1\/doctors\/[^/]+\/slots/;

  // List: server error, then Retry recovers.
  await page.route(listUrl, (r) => r.fulfill({ status: 500, contentType: "application/json", body: '{"status":500,"msg":"boom"}' }));
  await page.goto("/whatsapp");
  const listError = page.getByTestId("list-error");
  await expect(listError).toContainText("Couldn't load conversations");
  await expect(listError).toContainText("Server error (500)");
  // Network failure reads differently.
  await page.unroute(listUrl);
  await page.route(listUrl, (r) => r.abort("failed"));
  await listError.getByRole("button", { name: "Retry" }).click();
  await expect(listError).toContainText("No connection to the server");
  await page.unroute(listUrl);
  await listError.getByRole("button", { name: "Retry" }).click();
  await expect(row(page, SHABINA)).toBeVisible();

  // Open chat (and the patient panel, which comes from the same request): 404, then Retry.
  await page.route(chatUrl, (r) => r.fulfill({ status: 404, contentType: "application/json", body: '{"status":404,"msg":"Not Found"}' }));
  await row(page, SHABINA).click();
  await expect(page.getByTestId("chat-error")).toContainText("Couldn't load this chat");
  await expect(page.getByTestId("panel-error")).toContainText("Couldn't load patient details");
  await page.unroute(chatUrl);
  await page.getByTestId("chat-error").getByRole("button", { name: "Retry" }).click();
  await expect(page.getByTestId("chat-name")).toHaveText("Shabina Begum");
  await expect(page.getByTestId("patient-panel")).toContainText("E2E-0002");

  // Patient panel's own lookups (Quick book slots): error + Retry.
  await page.route(slotsUrl, (r) => r.fulfill({ status: 500, contentType: "application/json", body: '{"status":500,"msg":"boom"}' }));
  const panel = page.getByTestId("patient-panel");
  const inThreeDays = new Date(Date.now() + 5.5 * 3_600_000 + 3 * 86_400_000).toISOString().slice(0, 10);
  await panel.getByLabel("Date").fill(inThreeDays); // a date not fetched yet -> a fresh slots request
  await expect(panel.getByTestId("slots-error")).toContainText("Couldn't load slots", { timeout: 20_000 });
  await page.unroute(slotsUrl);
  await panel.getByTestId("slots-error").getByRole("button", { name: "Retry" }).click();
  await expect(panel.getByTestId("slots-error")).toBeHidden();
});

// ------------------------------------------------------------- ⋮ menu
test("⋮ menu: tags, search in chat, export (rendered templates), block/unblock", async ({ page }) => {
  await loginAs(page, RECEPTION);
  await openInbox(page, LAIQ);
  const more = page.getByRole("button", { name: "More actions" });

  await more.click();
  await page.getByRole("menuitem", { name: /^Tags/ }).click();
  const tags = page.getByRole("dialog");
  await tags.getByPlaceholder("e.g. VIP, Follow-up Needed").fill("vip");
  await tags.getByPlaceholder("e.g. VIP, Follow-up Needed").press("Enter");
  await tags.getByRole("button", { name: "Save Tags" }).click();
  await more.click();
  await expect(page.getByRole("menuitem", { name: /Tags · vip/ })).toBeVisible();
  await page.keyboard.press("Escape");

  await more.click();
  await page.getByRole("menuitem", { name: "Search in chat" }).click();
  await page.getByRole("dialog").getByLabel("Search messages").fill("khula");
  await expect(page.getByRole("dialog").getByText(/Clinic kitne baje tak khula hai/)).toBeVisible();
  await page.keyboard.press("Escape");

  await more.click();
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("menuitem", { name: "Export chat" }).click()]);
  const text = fs.readFileSync((await download.path())!, "utf8");
  expect(text).toContain("[Template · appointment_approved]");
  expect(text).toContain("MRD-E2E-1");
  expect(text).not.toContain("[template:");

  await more.click();
  await page.getByRole("menuitem", { name: "Block number" }).click();
  await expect(page.getByText("This number is blocked - the bot is silent")).toBeVisible();
  await more.click();
  await page.getByRole("menuitem", { name: "Unblock number" }).click();
  await expect(page.getByText("This number is blocked - the bot is silent")).toBeHidden();
});

test("sync stops after logout", async ({ page }) => {
  await loginAs(page, RECEPTION);
  await openInbox(page, SHABINA);
  let syncs = 0;
  page.on("request", (r) => { if (r.url().includes("/inbox/sync")) syncs += 1; });
  await page.getByRole("button", { name: "Logout" }).first().click();
  await page.waitForURL(/\/login/);
  syncs = 0;
  await page.waitForTimeout(25_000);
  expect(syncs).toBe(0);
});

// ----------------------------------------------------------------- access
for (const [key, allowed] of [["system_admin", true], ["admin", true], ["reception", true], ["doctor", false], ["pharmacy", false], ["lab", false], ["account", false]] as const) {
  test(`access: ${key} ${allowed ? "can" : "cannot"} open the inbox`, async ({ page }) => {
    await loginAs(page, USERS[key]);
    await page.goto("/whatsapp");
    if (allowed) await expect(page.getByRole("heading", { name: "Conversations" })).toBeVisible();
    else {
      await page.waitForLoadState("networkidle");
      await expect(page.getByRole("heading", { name: "Conversations" })).toBeHidden();
    }
  });
}

// ------------------------------------------------------- mobile + dark
test("mobile 390px: list -> chat -> patient panel -> back", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loginAs(page, RECEPTION);
  await openInbox(page);
  await row(page, SHABINA).click();
  await expect(page.getByTestId("chat-name")).toBeVisible();
  await expect(page.getByTestId("conversation-list")).toBeHidden();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, "no horizontal page scroll").toBeLessThanOrEqual(1);
  await page.getByRole("button", { name: "Patient details" }).click();
  await expect(page.getByTestId("patient-panel")).toBeVisible();
  await page.getByRole("button", { name: "Close patient details" }).click();
  await page.getByRole("button", { name: "Back to conversations" }).click();
  await expect(page.getByTestId("conversation-list")).toBeVisible();
  await page.screenshot({ path: path.join(QA_DIR, "screenshots", "inbox", "mobile-list.png") });
});

test("dark mode renders the inbox", async ({ page }) => {
  await loginAs(page, RECEPTION);
  await page.evaluate(() => localStorage.setItem("abdhind_theme", "dark"));
  await openInbox(page, SHABINA);
  await expect(page.locator("html")).toHaveClass(/dark/);
  const bg = await page.getByTestId("message-list").evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).not.toBe("rgb(239, 234, 226)");
  await page.screenshot({ path: path.join(QA_DIR, "screenshots", "inbox", "dark.png") });
  await page.evaluate(() => localStorage.setItem("abdhind_theme", "light"));
});

// ------------------------------------------------------------- WebKit
test("@webkit voice note plays in the Safari engine", async ({ page, browserName }) => {
  test.skip(browserName !== "webkit", "WebKit project only");
  await loginAs(page, RECEPTION);
  await openInbox(page, SHABINA);
  const voice = page.getByTestId("voice-player").first();
  await voice.getByRole("button", { name: "Play voice note" }).click();
  await expect(voice.getByRole("button", { name: "Pause voice note" })).toBeVisible({ timeout: 10_000 });
  await expect.poll(async () => voice.getByTestId("voice-time").textContent(), { timeout: 10_000 }).not.toBe("0:00");
  await expect(voice.getByText(/Can't play here/)).toBeHidden();
});

// --------------------------------------------------------------- load
test("load: one idle open inbox tab", async ({ page }) => {
  test.setTimeout(240_000);
  await loginAs(page, RECEPTION);
  const reqs: { url: string; at: number }[] = [];
  const syncSizes: number[] = [];
  page.on("request", (r) => { if (r.url().startsWith(API)) reqs.push({ url: r.url(), at: Date.now() }); });
  page.on("response", async (r) => {
    if (r.url().includes("/inbox/sync")) syncSizes.push((await r.body()).length);
  });
  await openInbox(page, SHABINA);
  await page.waitForTimeout(5_000); // let the opening burst settle
  const t0 = Date.now();
  await page.waitForTimeout(60_000);
  const visible = reqs.filter((r) => r.at >= t0);

  // Hidden tab (switch away): sync drops to once a minute.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(12_000); // finish the already-scheduled visible tick
  const t1 = Date.now();
  await page.waitForTimeout(60_000);
  const hidden = reqs.filter((r) => r.at >= t1);

  // Server response times on the local data.
  const token = await apiToken(api, RECEPTION);
  const time = async (url: string) => {
    const ms: number[] = [];
    for (let i = 0; i < 10; i++) {
      const s = performance.now();
      await inboxApi(api, token, "GET", url);
      ms.push(performance.now() - s);
    }
    return Math.round((ms.reduce((a, b) => a + b, 0) / ms.length) * 10) / 10;
  };
  const report = {
    visible_requests_per_min: visible.length,
    visible_endpoints: [...new Set(visible.map((r) => new URL(r.url).pathname))],
    hidden_requests_per_min: hidden.length,
    avg_sync_payload_bytes: Math.round(syncSizes.reduce((a, b) => a + b, 0) / Math.max(1, syncSizes.length)),
    sync_payload_bytes: (() => {
      const sorted = [...syncSizes].sort((a, b) => a - b);
      return { count: sorted.length, min: sorted[0], median: sorted[Math.floor(sorted.length / 2)], max: sorted.at(-1) };
    })(),
    avg_ms: {
      list: await time("/inbox/conversations?scope=all"),
      open: await time(`/inbox/conversations/${enc(cid(SHABINA))}`),
      sync_idle: await time(`/inbox/sync?since=${Date.now()}&scope=all`),
      sync_open_chat: await time(`/inbox/sync?since=${Date.now() - 60_000}&scope=all&open=${enc(cid(SHABINA))}`),
    },
  };
  fs.mkdirSync(QA_DIR, { recursive: true });
  fs.writeFileSync(path.join(QA_DIR, "inbox-load.json"), JSON.stringify(report, null, 2));
  console.log("LOAD", JSON.stringify(report));
  expect(report.visible_requests_per_min).toBeLessThanOrEqual(6);
  expect(report.visible_endpoints).toEqual(["/api/v1/inbox/sync"]);
  expect(report.hidden_requests_per_min).toBeLessThanOrEqual(1);
});
