import fs from "node:fs";
import path from "node:path";
import { expect, type Page, type APIRequestContext } from "@playwright/test";
import { getRouteAccessForPath, permissionsFromRule } from "../../src/lib/rbac/routes";
import { userHasPermission } from "../../src/lib/rbac/permissions";
import type { Permission } from "../../src/lib/auth/types";

// ---------------------------------------------------------------------------
// Safety: this suite must NEVER touch production.
// ---------------------------------------------------------------------------
export const FE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
export const API = process.env.E2E_API_URL ?? "http://localhost:8010";
const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
if (!LOCAL.test(FE) || !LOCAL.test(API)) {
  throw new Error(`Refusing to run: E2E_BASE_URL (${FE}) and E2E_API_URL (${API}) must both be local.`);
}
const PROD_HOST = /abdhindmedicare\.com/;

export const ROOT = path.resolve(__dirname, "../..");
export const QA_DIR = path.join(ROOT, "qa");

// ---------------------------------------------------------------------------
// Credentials (qa/test-users.local.md, gitignored)
// ---------------------------------------------------------------------------
export interface QaUser {
  key: string;
  role: string;
  name: string;
  phone: string;
  email: string;
  password: string;
}

export function loadUsers(): Record<string, QaUser> {
  const file = process.env.E2E_USERS_FILE ?? path.join(QA_DIR, "test-users.local.md");
  const rows = fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter((l) => l.startsWith("|") && !l.includes("---") && !l.includes("| key |"));
  const users: Record<string, QaUser> = {};
  for (const row of rows) {
    const [key, role, name, phone, email, password] = row.split("|").slice(1).map((c) => c.trim());
    if (/^\d{10}$/.test(phone) && password && password !== "(pending)") users[key] = { key, role, name, phone, email, password };
  }
  return users;
}

// ---------------------------------------------------------------------------
// Route inventory, read from src/app so new pages are covered automatically.
// ---------------------------------------------------------------------------
export type Area = "public" | "auth" | "erp";
export interface RouteEntry {
  /** Pattern as written in src/app (route groups stripped). */
  pattern: string;
  /** Concrete URL that gets visited. */
  url: string;
  area: Area;
  /** What the page should show when the role may open it. */
  expect: "page" | "erp-404" | "public-404" | "coming-soon";
}

const SAMPLE_PARAMS: Record<string, string> = {
  "/careers/apply/[id]": "/careers/apply/1",
  "/products/[id]": "/products/bamboo-toothbrush",
};
const COMING_SOON = ["clinical-records", "test-reports", "prescriptions", "invoices", "payments"];

export function routeInventory(): RouteEntry[] {
  const appDir = path.join(ROOT, "src/app");
  const entries: RouteEntry[] = [];
  const walk = (dir: string) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (name === "page.tsx") {
        const rel = path.relative(appDir, path.dirname(full)).split(path.sep);
        const group = rel.find((s) => /^\(.*\)$/.test(s)) ?? "";
        const area: Area = group === "(erp)" ? "erp" : group === "(auth)" ? "auth" : "public";
        const pattern = "/" + rel.filter((s) => !/^\(.*\)$/.test(s)).join("/");
        const clean = pattern === "/" ? "/" : pattern.replace(/\/$/, "");
        if (clean.includes("[...missing]")) {
          entries.push({ pattern: clean, url: clean.replace("[...missing]", "__qa_missing__"), area, expect: "erp-404" });
        } else if (clean.includes("[[...module]]")) {
          for (const m of COMING_SOON) entries.push({ pattern: clean, url: `/coming-soon/${m}`, area, expect: "coming-soon" });
          entries.push({ pattern: clean, url: "/coming-soon", area, expect: "erp-404" });
          entries.push({ pattern: clean, url: "/coming-soon/not-a-module", area, expect: "erp-404" });
        } else if (clean.includes("[")) {
          const url = SAMPLE_PARAMS[clean];
          if (!url) throw new Error(`No sample URL for dynamic route ${clean} — add one to SAMPLE_PARAMS.`);
          entries.push({ pattern: clean, url, area, expect: "page" });
        } else {
          entries.push({ pattern: clean, url: clean, area, expect: "page" });
        }
      }
    }
  };
  walk(appDir);
  // Unmatched URL -> root not-found (public chrome).
  entries.push({ pattern: "(unmatched)", url: "/__qa_unknown_page__", area: "public", expect: "public-404" });
  return entries.sort((a, b) => a.area.localeCompare(b.area) || a.url.localeCompare(b.url));
}

/** Same rule the app's guard applies (rbac/routes.ts + manage wildcard). */
export function canOpen(url: string, permissions: Permission[] | null): boolean {
  if (!permissions) return false;
  const rule = getRouteAccessForPath(url.split("?")[0]);
  if (!rule) return true;
  const required = permissionsFromRule(rule) ?? [];
  return required.length === 0 || required.some((p) => userHasPermission(permissions, p));
}

// ---------------------------------------------------------------------------
// Per-page instrumentation
// ---------------------------------------------------------------------------
export interface Collected {
  console: string[];
  pageErrors: string[];
  api: string[];
  prodAttempts: string[];
}

const IGNORED_CONSOLE = [/Download the React DevTools/i, /\[Fast Refresh\]/, /\[HMR\]/];

/** Guards + collectors. Every browser API call gets its own X-Forwarded-For so
 * a full matrix run doesn't trip the per-IP rate limiter (the local backend is
 * started with TRUSTED_PROXIES=127.0.0.1 for this). */
export async function instrument(page: Page): Promise<Collected> {
  const c: Collected = { console: [], pageErrors: [], api: [], prodAttempts: [] };
  await page.route(PROD_HOST, async (route) => {
    c.prodAttempts.push(route.request().url());
    await route.abort();
  });
  await page.route(`${API}/**`, async (route) => {
    const headers = { ...route.request().headers(), "x-forwarded-for": randomIp() };
    await route.continue({ headers });
  });
  page.on("console", (msg) => {
    if (msg.type() !== "error" && !/hydrat/i.test(msg.text())) return;
    if (IGNORED_CONSOLE.some((r) => r.test(msg.text()))) return;
    c.console.push(msg.text().slice(0, 300));
  });
  page.on("pageerror", (err) => c.pageErrors.push(err.message.slice(0, 300)));
  page.on("response", (res) => {
    if (res.url().startsWith(API) && res.status() >= 400) {
      c.api.push(`${res.status()} ${res.request().method()} ${res.url().replace(API, "")}`);
    }
  });
  return c;
}

export function resetCollected(c: Collected) {
  c.console.length = 0;
  c.pageErrors.length = 0;
  c.api.length = 0;
}

export function randomIp() {
  return `10.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 254)}`;
}
const rand = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

/** Navigate and wait until the app has settled (chrome rendered, no auth loader). */
export async function visit(page: Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page
    .waitForFunction(
      () => !!document.querySelector('[data-testid="erp-shell"],[data-testid="site-navbar"],[data-testid="auth-layout"]'),
      null,
      { timeout: 30_000 }
    )
    .catch(() => {});
  await page
    .waitForFunction(() => !/Verifying session|Signing you out/.test(document.body.innerText), null, { timeout: 20_000 })
    .catch(() => {});
  await page.waitForTimeout(1_200);
  await page.waitForLoadState("networkidle", { timeout: 6_000 }).catch(() => {});
}

export interface Observed {
  erp: boolean;
  erpSidebarVisible: boolean;
  site: boolean;
  floating: boolean;
  auth: boolean;
  path: string;
  search: string;
  text: string;
  overflowX: number;
  stuckLoader: boolean;
}

export async function observe(page: Page): Promise<Observed> {
  return page.evaluate(() => {
    const sidebar = document.querySelector('[data-testid="erp-sidebar"]') as HTMLElement | null;
    return {
      erp: !!document.querySelector('[data-testid="erp-shell"]'),
      erpSidebarVisible: !!sidebar && sidebar.offsetParent !== null && getComputedStyle(sidebar).display !== "none",
      site: !!document.querySelector('[data-testid="site-navbar"],[data-testid="site-footer"]'),
      floating: !!document.querySelector('[data-testid="floating-buttons"]'),
      auth: !!document.querySelector('[data-testid="auth-layout"]'),
      path: location.pathname,
      search: location.search,
      text: document.body.innerText.slice(0, 5000),
      overflowX: document.documentElement.scrollWidth - window.innerWidth,
      stuckLoader: /Verifying session/.test(document.body.innerText),
    };
  });
}

export function slug(url: string) {
  return (url === "/" ? "home" : url.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "_")).slice(0, 80);
}

export function screenshotPath(roleKey: string, url: string, suffix = "") {
  const dir = path.join(QA_DIR, "screenshots", roleKey);
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${slug(url)}${suffix}.png`);
}

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------
export async function uiLogin(page: Page, user: { phone: string; password: string }) {
  // Already on /login (e.g. after an ERP redirect)? Stay, so ?next= is kept.
  if (new URL(page.url()).pathname !== "/login") await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder("Enter 10-digit mobile number").waitFor();
  await page.getByPlaceholder("Enter 10-digit mobile number").fill(user.phone);
  await page.getByPlaceholder("Enter your password").fill(user.password);
  await page.locator('button[type="submit"]').first().click();
}

export async function sessionPermissions(page: Page): Promise<Permission[] | null> {
  return page.evaluate(() => {
    const raw = localStorage.getItem("abdhind_auth_session") ?? sessionStorage.getItem("abdhind_auth_session");
    if (!raw) return null;
    try {
      return (JSON.parse(raw).user?.permissions ?? []) as never;
    } catch {
      return null;
    }
  });
}

export async function apiLogin(request: APIRequestContext, user: { phone: string; password: string }) {
  const res = await request.post(`${API}/api/v1/auth/login`, {
    data: { phone_number: user.phone, password: user.password },
    headers: { "x-forwarded-for": randomIp() },
  });
  const body = await res.json();
  expect(res.status(), JSON.stringify(body)).toBe(200);
  return body.data.tokens.access_token as string;
}

export async function api(request: APIRequestContext, token: string, method: string, url: string, data?: unknown) {
  const res = await request.fetch(`${API}/api/v1${url}`, {
    method,
    data,
    headers: { Authorization: `Bearer ${token}`, "x-forwarded-for": randomIp() },
  });
  return { status: res.status(), body: await res.json().catch(() => ({})) };
}
