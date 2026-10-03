import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, type APIRequestContext, type Page } from "@playwright/test";
import { API, ROOT, randomIp, uiLogin, type QaUser } from "./lib";

/**
 * Inbox E2E plumbing. The E2E backend runs with a LOCAL webhook secret and
 * META_GRAPH_BASE_URL pointing at tests/e2e/mock-meta.mjs, so simulated
 * WhatsApp traffic never touches Meta or a real phone (see playwright.inbox.config.ts).
 */
export const WEBHOOK_SECRET = process.env.E2E_WEBHOOK_SECRET ?? "e2e-local-secret";
export const MOCK = process.env.E2E_MOCK_META_URL ?? "http://127.0.0.1:8099";
export const BE_DIR = process.env.E2E_BE_DIR ?? path.resolve(ROOT, "../abdhind-medicare-be");

/** Fake E2E numbers (Meta id form, no "+"): 919990000001 … 919990000049. */
export const metaId = (n: number) => `91999000${String(n).padStart(4, "0")}`;
export const cid = (n: number) => `+${metaId(n)}`;

// ---------- backend fixtures ----------
export function fixtures<T = Record<string, string>>(cmd: string, ...args: string[]): T {
  const out = execFileSync(path.join(BE_DIR, "venv/bin/python"), ["scripts/e2e_inbox_fixtures.py", cmd, ...args], {
    cwd: BE_DIR,
    env: { ...process.env, E2E_FIXTURES: "1" },
    encoding: "utf8",
  });
  return JSON.parse(out.trim().split("\n").pop()!);
}

export function runBackendScript(script: string, ...args: string[]): string {
  return execFileSync(path.join(BE_DIR, "venv/bin/python"), [script, ...args], { cwd: BE_DIR, encoding: "utf8" });
}

// ---------- mock Meta ----------
export interface MockCall {
  method: string;
  path: string;
  at: number;
  body: Record<string, unknown> | string | null;
}
export async function mockCalls(request: APIRequestContext): Promise<MockCall[]> {
  return (await (await request.get(`${MOCK}/__control/calls`)).json()).calls;
}
export async function mockSends(request: APIRequestContext, to?: string) {
  return (await mockCalls(request)).filter(
    (c) => c.method === "POST" && c.path.endsWith("/messages") && typeof c.body === "object" && c.body?.to && (!to || c.body.to === to.replace("+", ""))
  ) as (MockCall & { body: Record<string, unknown> })[];
}
export async function mockReset(request: APIRequestContext) {
  await request.post(`${MOCK}/__control/reset`);
}
export async function mockFail(request: APIRequestContext, on: boolean) {
  await request.post(`${MOCK}/__control/fail`, { data: { on } });
}
export async function mockMedia(request: APIRequestContext, id: string, file: string, mime: string) {
  await request.post(`${MOCK}/__control/media`, { data: { id, path: file, mime } });
}

// ---------- media files (generated once per run) ----------
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "inbox-e2e-"));
export function mediaFile(kind: "voice" | "image" | "pdf"): string {
  const file = path.join(TMP, { voice: "voice.ogg", image: "photo.png", pdf: "report.pdf" }[kind]);
  if (fs.existsSync(file)) return file;
  if (kind === "voice") {
    execFileSync("ffmpeg", ["-nostdin", "-v", "error", "-y", "-f", "lavfi", "-i", "sine=frequency=330:duration=3",
      "-af", "volume=0.6", "-c:a", "libopus", file]);
  } else if (kind === "image") {
    execFileSync("ffmpeg", ["-nostdin", "-v", "error", "-y", "-f", "lavfi", "-i", "testsrc=size=480x320:rate=1", "-frames:v", "1", file]);
  } else {
    fs.writeFileSync(file, "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n");
  }
  return file;
}

// ---------- signed webhooks ----------
let seq = 0;
export async function webhook(request: APIRequestContext, from: string, message: Record<string, unknown>, name = "Test Patient") {
  seq += 1;
  const body = JSON.stringify({
    entry: [{ changes: [{ value: {
      contacts: [{ profile: { name }, wa_id: from }],
      messages: [{ from, id: `wamid.E2E${Date.now()}${seq}`, timestamp: String(Math.floor(Date.now() / 1000)), ...message }],
    } }] }],
  });
  const sig = "sha256=" + crypto.createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex");
  const res = await request.post(`${API}/api/v1/whatsapp/webhook`, {
    data: body,
    headers: { "content-type": "application/json", "x-hub-signature-256": sig },
  });
  expect(res.status(), await res.text()).toBe(200);
  return res.json();
}
export const sayText = (r: APIRequestContext, from: string, text: string, name?: string) =>
  webhook(r, from, { type: "text", text: { body: text } }, name);
export const tapButton = (r: APIRequestContext, from: string, text: string, name?: string, payload = text) =>
  webhook(r, from, { type: "button", button: { text, payload } }, name);

export async function sendMedia(r: APIRequestContext, from: string, kind: "voice" | "image" | "pdf", name?: string) {
  const id = `MEDIA_${kind}_${Date.now()}_${seq + 1}`;
  const mime = { voice: "audio/ogg", image: "image/png", pdf: "application/pdf" }[kind];
  await mockMedia(r, id, mediaFile(kind), mime);
  const message =
    kind === "voice" ? { type: "audio", audio: { id, mime_type: "audio/ogg; codecs=opus", voice: true } }
    : kind === "image" ? { type: "image", image: { id, mime_type: mime, caption: "Daant ki photo" } }
    : { type: "document", document: { id, mime_type: mime, filename: "Old prescription.pdf" } };
  return webhook(r, from, message, name);
}

// ---------- auth ----------
export async function loginAs(page: Page, user: QaUser) {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": randomIp() });
  await uiLogin(page, user);
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30_000 });
}

export async function apiToken(request: APIRequestContext, user: QaUser): Promise<string> {
  const res = await request.post(`${API}/api/v1/auth/login`, {
    data: { phone_number: user.phone, password: user.password },
    headers: { "x-forwarded-for": randomIp() },
  });
  expect(res.status()).toBe(200);
  return (await res.json()).data.tokens.access_token;
}

export async function inboxApi(request: APIRequestContext, token: string, method: string, url: string, data?: unknown) {
  const res = await request.fetch(`${API}/api/v1${url}`, {
    method,
    data,
    headers: { Authorization: `Bearer ${token}`, "x-forwarded-for": randomIp() },
  });
  return { status: res.status(), body: await res.json().catch(() => ({})) };
}

export const enc = (id: string) => encodeURIComponent(id);
