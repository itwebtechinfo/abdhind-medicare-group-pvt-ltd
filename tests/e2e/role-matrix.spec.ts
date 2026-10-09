import fs from "node:fs";
import path from "node:path";
import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import {
  QA_DIR,
  api,
  apiLogin,
  canOpen,
  instrument,
  loadUsers,
  observe,
  resetCollected,
  routeInventory,
  screenshotPath,
  sessionPermissions,
  uiLogin,
  visit,
  type Collected,
  type QaUser,
  type RouteEntry,
} from "./lib";

/**
 * Every route × every role, against LOCAL frontend + backend only.
 * Read-only on real data: the only writes are to QA records (QA users, the
 * "QA Walkin" appointment, a QA enquiry). Nothing here sends WhatsApp.
 */

const USERS = loadUsers();
const ROUTES = routeInventory();
const ROLE_COLUMNS = ["logged_out", "system_admin", "admin", "reception", "doctor", "pharmacy", "lab", "account", "patient"];
/** Pages whose first row opens a detail drawer (smoke-tested). */
const DRAWER_PAGES = new Set(["/appointments", "/patients", "/enquiries", "/admin/users"]);
/** Known backend issues: reported, not frontend bugs. */
const KNOWN: { role: string; url: RegExp; note: string }[] = [
  { role: "patient", url: /^\/reports/, note: "backend: patient has reports:view (clinic-wide analytics)" },
];

type Cell = { status: "PASS" | "FAIL" | "NO ACCESS" | "KNOWN" | "PENDING"; reason?: string };
const matrix: Record<string, Record<string, Cell>> = {};
const bugs: { role: string; url: string; problem: string; screenshot: string }[] = [];
const notes: string[] = [];

function record(role: string, url: string, cell: Cell, shot = "") {
  (matrix[url] ??= {})[role] = cell;
  if (cell.status === "FAIL") bugs.push({ role, url, problem: cell.reason ?? "", screenshot: path.relative(process.cwd(), shot) });
}

/** Evaluate one visited page against what the role should see. */
function judge(entry: RouteEntry, role: string, perms: string[] | null, o: Awaited<ReturnType<typeof observe>>, c: Collected): Cell {
  const problems: string[] = [];
  const loggedIn = perms !== null;
  if (c.pageErrors.length) problems.push(`page error: ${c.pageErrors[0]}`);
  // A 404 page's own document response logs "status of 404" - that's the
  // expected outcome there, not a broken resource.
  const consoleErrors = entry.expect.endsWith("404") ? c.console.filter((m) => !/status of 404/.test(m)) : c.console;
  if (consoleErrors.length) problems.push(`console: ${consoleErrors[0]}`);
  if (o.stuckLoader) problems.push("stuck on auth loader");

  if (entry.area === "public") {
    if (o.erp) problems.push("ERP shell on a public page");
    if (!o.site) problems.push("website navbar/footer missing");
    if (!o.floating) problems.push("floating buttons missing");
    if (entry.expect === "public-404" && !/404|unavailable/i.test(o.text)) problems.push("public 404 content missing");
    if (c.api.length) problems.push(`api: ${c.api[0]}`);
    return problems.length ? { status: "FAIL", reason: problems.join("; ") } : { status: "PASS" };
  }

  if (entry.area === "auth") {
    if (o.site || o.floating) problems.push("website chrome on an auth page");
    if (o.erp) {
      // Signed-in user opening /login is sent to their landing page - expected.
      if (!(entry.url === "/login" && loggedIn)) problems.push("ERP shell on an auth page");
    } else if (!o.auth) problems.push("auth layout missing");
    if (entry.url === "/change-password" && !loggedIn && o.path !== "/login") problems.push("signed-out user not sent to /login");
    if (c.api.length) problems.push(`api: ${c.api[0]}`);
    if (problems.length) return { status: "FAIL", reason: problems.join("; ") };
    if (entry.url === "/login" && loggedIn) return { status: "PASS", reason: "signed in -> landing page" };
    return { status: "PASS" };
  }

  // ERP
  const allowed = loggedIn && canOpen(entry.url, perms as never);
  if (!loggedIn) {
    const expected = `/login`;
    if (o.path !== expected || !o.search.includes(`next=${encodeURIComponent(entry.url)}`))
      problems.push(`expected /login?next=..., got ${o.path}${o.search}`);
    if (o.erp) problems.push("ERP shell shown to a signed-out user");
    return problems.length ? { status: "FAIL", reason: problems.join("; ") } : { status: "NO ACCESS", reason: "-> /login?next" };
  }
  if (!allowed) {
    if (o.path !== "/unauthorized") problems.push(`expected /unauthorized, got ${o.path}`);
    else if (!/don't have access/i.test(o.text)) problems.push("access-denied message missing");
    if (o.site || o.floating) problems.push("website chrome");
    return problems.length ? { status: "FAIL", reason: problems.join("; ") } : { status: "NO ACCESS" };
  }
  if (!o.erp) problems.push("ERP shell missing");
  if (o.site || o.floating) problems.push("website chrome inside ERP");
  if (o.path !== entry.url.split("?")[0]) problems.push(`redirected to ${o.path}`);
  if (entry.expect === "erp-404" && !/Page not found/.test(o.text)) problems.push("ERP 404 content missing");
  if (entry.expect === "coming-soon" && !/Coming soon/i.test(o.text)) problems.push("coming-soon content missing");
  if (c.api.length) problems.push(`api: ${c.api.join(", ").slice(0, 200)}`);
  const known = KNOWN.find((k) => k.role === role && k.url.test(entry.url));
  if (problems.length) return { status: "FAIL", reason: problems.join("; ") };
  return known ? { status: "KNOWN", reason: known.note } : { status: "PASS" };
}

/** Light, read-only interactions on an allowed ERP page. Never clicks action buttons. */
async function smokeActions(page: Page, url: string): Promise<string[]> {
  const problems: string[] = [];
  const main = page.locator('[data-testid="erp-shell"] main');
  try {
    const tabs = main.getByRole("tab");
    if ((await tabs.count()) > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(900);
      await tabs.nth(0).click();
      await page.waitForTimeout(600);
    }
    const search = main.locator('input[type="search"]').first();
    if (await search.count()) {
      await search.fill("qa");
      await page.waitForTimeout(900);
      await search.fill("");
      await page.waitForTimeout(600);
    }
    if (DRAWER_PAGES.has(url)) {
      const row = main.locator('[role="button"]').first();
      if (await row.count()) {
        // Click the name/time text, never the action buttons in the row.
        await row.locator("p").first().click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog")).toBeHidden();
      }
    }
    const more = main.getByRole("button", { name: "Load more" });
    if (await more.count()) {
      await more.first().click();
      await page.waitForTimeout(900);
    }
  } catch (err) {
    problems.push(`action: ${(err as Error).message.split("\n")[0].slice(0, 160)}`);
  }
  return problems;
}

async function checkRoute(page: Page, c: Collected, roleKey: string, perms: string[] | null, entry: RouteEntry) {
  resetCollected(c);
  await page.setViewportSize({ width: 1440, height: 900 });
  await visit(page, entry.url);
  const o = await observe(page);
  const shot = screenshotPath(roleKey, entry.url);
  await page.screenshot({ path: shot, fullPage: false });
  const cell = judge(entry, roleKey, perms, o, c);

  // Smoke interactions only where the role really is on the page.
  if (entry.area === "erp" && entry.expect === "page" && cell.status !== "FAIL" && o.path === entry.url && perms) {
    const actionProblems = await smokeActions(page, entry.url);
    const late = [...c.pageErrors, ...c.console.map((m) => `console: ${m}`), ...c.api.map((a) => `api: ${a}`)];
    if (actionProblems.length || late.length) {
      cell.status = "FAIL";
      cell.reason = [...actionProblems, ...late].join("; ").slice(0, 300);
    }
  }

  // Mobile 390px: no horizontal scroll; ERP sidebar collapses.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(700);
  const m = await observe(page);
  await page.screenshot({ path: screenshotPath(roleKey, entry.url, "-mobile") });
  const mobileProblems: string[] = [];
  if (m.overflowX > 1) mobileProblems.push(`mobile: horizontal scroll (${m.overflowX}px)`);
  if (m.erp && m.erpSidebarVisible) mobileProblems.push("mobile: desktop sidebar still visible");
  if (mobileProblems.length) {
    cell.status = "FAIL";
    cell.reason = [cell.reason, ...mobileProblems].filter(Boolean).join("; ");
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  record(roleKey, entry.url, cell, shot);
}

/** Sidebar: every visible item opens a working ERP page for this role. */
async function checkSidebar(page: Page, c: Collected, roleKey: string, perms: string[]) {
  await visit(page, "/dashboard");
  const sidebar = page.locator('[data-testid="erp-sidebar"]');
  // Open every collapsed group so its sub-items are rendered and clickable.
  for (let i = 0; i < 10; i++) {
    const closed = sidebar.locator('button[aria-expanded="false"]').first();
    if (!(await closed.count())) break;
    await closed.click();
    await page.waitForTimeout(200);
  }
  const hrefs = [...new Set(await sidebar.locator("a[href]").evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? "")))].filter(
    (h) => h.startsWith("/")
  );
  for (const href of hrefs) {
    resetCollected(c);
    const link = sidebar.locator(`a[href="${href}"]`).first();
    if (await link.isVisible()) {
      await link.click();
      await page.waitForURL((u) => u.pathname === href.split("?")[0], { timeout: 20_000 }).catch(() => {});
      await page.waitForTimeout(1_200);
    } else {
      await visit(page, href); // collapsed sub-item: open by URL
      notes.push(`${roleKey}: sidebar item ${href} is inside a collapsed group (opened by URL)`);
    }
    const o = await observe(page);
    const problems: string[] = [];
    if (o.path !== href.split("?")[0]) problems.push(`sidebar ${href} -> ${o.path}`);
    if (!o.erp || o.site) problems.push(`sidebar ${href}: wrong layout`);
    if (!canOpen(href, perms as never)) problems.push(`sidebar shows ${href} which this role can't open`);
    if (c.pageErrors.length) problems.push(`page error: ${c.pageErrors[0]}`);
    if (problems.length) {
      const shot = screenshotPath(roleKey, `sidebar_${href}`);
      await page.screenshot({ path: shot });
      bugs.push({ role: roleKey, url: href, problem: problems.join("; "), screenshot: path.relative(process.cwd(), shot) });
    }
  }
  // Reachable ERP pages with no sidebar link (informational).
  const linked = new Set(hrefs.map((h) => h.split("?")[0]));
  for (const e of ROUTES) {
    if (e.area === "erp" && e.expect === "page" && canOpen(e.url, perms as never) && !linked.has(e.url)) {
      notes.push(`${roleKey}: can open ${e.url} but has no sidebar link`);
    }
  }
}

/** Bell, profile menu, theme toggle, logout. */
async function checkTopbar(page: Page, roleKey: string) {
  const problems: string[] = [];
  try {
    await visit(page, "/dashboard");
    await page.getByRole("button", { name: /^Notifications/ }).click();
    await expect(page.getByText("Notifications", { exact: true }).first()).toBeVisible();
    await page.keyboard.press("Escape");
    const wasDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    await page.getByRole("button", { name: /Switch to (dark|light) mode/ }).first().click();
    await page.waitForTimeout(400);
    const nowDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    if (nowDark === wasDark) problems.push("theme toggle did nothing");
    await page.getByRole("button", { name: /Switch to (dark|light) mode/ }).first().click();
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Logout" }).click();
    await page.waitForURL(/\/login/, { timeout: 20_000 });
  } catch (err) {
    problems.push(`topbar: ${(err as Error).message.split("\n")[0].slice(0, 160)}`);
  }
  if (problems.length) {
    const shot = screenshotPath(roleKey, "topbar");
    await page.screenshot({ path: shot });
    bugs.push({ role: roleKey, url: "(topbar)", problem: problems.join("; "), screenshot: path.relative(process.cwd(), shot) });
  }
}

// ---------------------------------------------------------------------------

// Independent tests (one failure doesn't skip the rest); workers=1 keeps them in order.

for (const roleKey of ROLE_COLUMNS) {
  test(`role matrix: ${roleKey}`, async ({ page }) => {
    const c = await instrument(page);
    if (roleKey === "logged_out") {
      for (const entry of ROUTES) await checkRoute(page, c, roleKey, null, entry);
      expect(c.prodAttempts, "requests aimed at production").toEqual([]);
      return;
    }
    const user = USERS[roleKey];
    if (!user) {
      for (const entry of ROUTES) record(roleKey, entry.url, { status: "PENDING", reason: "QA user not created yet" });
      test.skip(true, `no QA user for ${roleKey} in qa/test-users.local.md`);
      return;
    }
    // 1. Login -> landing page
    await uiLogin(page, user);
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 }).catch(async () => {
      bugs.push({ role: roleKey, url: "/login", problem: `landing page was ${page.url()}`, screenshot: "" });
    });
    const perms = (await sessionPermissions(page)) ?? [];
    // 2-3. Sidebar, then every route by URL
    await checkSidebar(page, c, roleKey, perms);
    for (const entry of ROUTES) await checkRoute(page, c, roleKey, perms, entry);
    // Topbar last (ends with logout)
    await checkTopbar(page, roleKey);
    expect(c.prodAttempts, "requests aimed at production").toEqual([]);
  });
}

// ---------------------------------------------------------------------------
// Special flows
// ---------------------------------------------------------------------------

async function sysToken(request: APIRequestContext) {
  return apiLogin(request, USERS.system_admin);
}

test("special: signed-out deep link -> login -> back to the page (or landing if not allowed)", async ({ page }) => {
  await instrument(page);
  await visit(page, "/patients?x=1");
  expect(page.url()).toContain("/login?next=%2Fpatients%3Fx%3D1");
  await uiLogin(page, USERS.reception);
  await page.waitForURL(/\/patients\?x=1/, { timeout: 30_000 });
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "Logout" }).click();
  await page.waitForURL(/\/login/);

  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
  await visit(page, "/admin/users");
  await uiLogin(page, USERS.pharmacy);
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
});

test("special: must-change-password on first login (invited user)", async ({ page, request }) => {
  await instrument(page);
  const token = await sysToken(request);
  const list = await api(request, token, "GET", "/users?tab=all&search=QA%20Invitee&limit=5");
  const invitee = list.body.data.users[0];
  const reset = await api(request, token, "POST", `/users/${invitee.id}/reset-password`);
  const temp = reset.body.data.temporary_password as string;
  await uiLogin(page, { phone: USERS.invitee.phone, password: temp });
  await page.waitForURL(/\/change-password/, { timeout: 30_000 });
  await visit(page, "/patients");
  await expect(page).toHaveURL(/\/change-password/);
  await page.screenshot({ path: path.join(QA_DIR, "screenshots", "invitee", "change-password.png") });
  await page.getByLabel("Temporary password").fill(temp);
  await page.getByLabel("New password", { exact: true }).fill(USERS.invitee.password);
  await page.getByLabel("Confirm new password").fill(USERS.invitee.password);
  await page.getByRole("button", { name: "Save new password" }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
});

test("special: deactivated user is blocked, and a live session ends on the next action", async ({ browser, request }) => {
  const token = await sysToken(request);
  const list = await api(request, token, "GET", "/users?tab=all&search=QA%20Deactivated&limit=5");
  const user = list.body.data.users[0];
  if (user.status === "deactivated") await api(request, token, "POST", `/users/${user.id}/reactivate`);

  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await instrument(page);
  await uiLogin(page, USERS.deactivated);
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
  await api(request, token, "POST", `/users/${user.id}/deactivate`);
  await visit(page, "/patients");
  await expect(page).toHaveURL(/\/login/);
  await uiLogin(page, USERS.deactivated);
  await expect(page.getByText("This account has been deactivated. Please contact the clinic admin.")).toBeVisible();
  await page.screenshot({ path: path.join(QA_DIR, "screenshots", "deactivated", "login-blocked.png") });
  await ctx.close();
});

test("special: signed-in staff on the public website (Dashboard / Logout buttons)", async ({ page }) => {
  await instrument(page);
  await uiLogin(page, USERS.reception);
  await page.waitForURL(/\/dashboard/);
  await visit(page, "/");
  const o = await observe(page);
  expect(o.site && o.floating && !o.erp).toBe(true);
  await page.locator('[data-testid="site-navbar"]').getByRole("link", { name: "Dashboard" }).first().click();
  await page.waitForURL(/\/dashboard/);
  expect((await observe(page)).erp).toBe(true);
  await visit(page, "/products");
  await page.locator('[data-testid="site-navbar"]').getByRole("button", { name: /Logout/ }).first().click();
  await page.waitForTimeout(1_500);
  const after = await observe(page);
  expect(after.site && !after.erp).toBe(true);
});

test("special: deep links open the right drawer (?appointment=, ?enquiry=)", async ({ page, request }) => {
  await instrument(page);
  const token = await sysToken(request);
  // QA fixtures (idempotent): one appointment for "QA Walkin", one website enquiry.
  const docs = await api(request, token, "GET", "/doctors");
  const doc = docs.body.data.doctors.find((d: { full_name: string }) => d.full_name === "Dr. QA Doctor");
  const docId = doc.id ?? doc._id;
  let appts = await api(request, token, "GET", "/appointments?tab=upcoming&search=QA%20Walkin");
  if (!appts.body.data.appointments.length) {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    const slots = await api(request, token, "GET", `/doctors/${docId}/slots?date=${tomorrow}`);
    const slot = slots.body.data.slots.find((s: { is_booked: boolean }) => !s.is_booked);
    const created = await api(request, token, "POST", "/appointments", {
      patient_phone: "9000090020", patient_name: "QA Walkin", patient_age: 30, patient_gender: "Male",
      patient_address: "", doctor_id: docId, slot_id: slot.id ?? slot._id,
    });
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    appts = await api(request, token, "GET", "/appointments?tab=upcoming&search=QA%20Walkin");
  }
  const appt = appts.body.data.appointments[0];
  await request.post(`http://localhost:8010/api/v1/public/enquiries`, {
    data: { full_name: "QA Enquiry", phone: "9000090021", preferred_time: "Morning (11:30 AM - 1 PM)" },
    headers: { "x-forwarded-for": "10.200.0.1" },
  });
  const enq = await api(request, token, "GET", "/enquiries?search=QA%20Enquiry&limit=5");
  const enquiry = enq.body.data.enquiries[0];

  await uiLogin(page, USERS.reception);
  await page.waitForURL(/\/dashboard/);
  await visit(page, `/appointments?appointment=${appt._id}&patient=${appt.patient_id}`);
  await expect(page.getByRole("dialog").getByText("QA Walkin").first()).toBeVisible();
  await page.screenshot({ path: path.join(QA_DIR, "screenshots", "reception", "deeplink-appointment.png") });
  await page.keyboard.press("Escape");
  await visit(page, `/enquiries?enquiry=${enquiry._id}`);
  await expect(page.getByRole("dialog").getByText("QA Enquiry").first()).toBeVisible();
  await page.screenshot({ path: path.join(QA_DIR, "screenshots", "reception", "deeplink-enquiry.png") });
  notes.push("?phone= (WhatsApp inbox) deep link: tested with the QA patient's conversation once that user exists.");
});

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

test.afterAll(() => {
  fs.mkdirSync(QA_DIR, { recursive: true });
  // A partial run (e.g. --grep patient) keeps the other columns from the last report.
  const ran = new Set(Object.values(matrix).flatMap((cells) => Object.keys(cells)));
  try {
    const prev = JSON.parse(fs.readFileSync(path.join(QA_DIR, "role-matrix.json"), "utf8"));
    for (const [u, cells] of Object.entries(prev.matrix as Record<string, Record<string, Cell>>)) {
      for (const [role, cell] of Object.entries(cells)) if (!ran.has(role)) (matrix[u] ??= {})[role] = cell;
    }
    bugs.push(...(prev.bugs as typeof bugs).filter((b) => !ran.has(b.role)));
  } catch {
    // no previous report
  }
  const header = `| route | ${ROLE_COLUMNS.join(" | ")} |\n|---|${ROLE_COLUMNS.map(() => "---").join("|")}|`;
  const urls = [...new Set(ROUTES.map((r) => r.url))];
  const rows = urls.map((u) => {
    const cells = ROLE_COLUMNS.map((role) => {
      const cell = matrix[u]?.[role];
      if (!cell) return "—";
      return cell.reason ? `${cell.status} (${cell.reason.replace(/\|/g, "/").slice(0, 120)})` : cell.status;
    });
    return `| ${u} | ${cells.join(" | ")} |`;
  });
  const bugLines = bugs.map((b) => `- [${b.role}] ${b.url}: ${b.problem}${b.screenshot ? ` — ${b.screenshot}` : ""}`);
  fs.writeFileSync(
    path.join(QA_DIR, "role-matrix.md"),
    `# Role × route matrix\n\nGenerated ${new Date().toISOString()}\n\n${header}\n${rows.join("\n")}\n\n## Bugs (${bugs.length})\n${bugLines.join("\n") || "None"}\n\n## Notes\n${[...new Set(notes)].map((n) => `- ${n}`).join("\n") || "None"}\n`
  );
  fs.writeFileSync(path.join(QA_DIR, "role-matrix.json"), JSON.stringify({ matrix, bugs, notes: [...new Set(notes)] }, null, 2));
});
