// Local stand-in for Meta's Graph API, used ONLY by the inbox E2E run.
// The E2E backend is started with META_GRAPH_BASE_URL=http://127.0.0.1:8099,
// so nothing the tests do can reach WhatsApp or a real phone. Every call is
// recorded and can be inspected (GET /__control/calls) - which is how the
// suite proves e.g. that an internal note made no outgoing call at all.
//
//   node tests/e2e/mock-meta.mjs            (port 8099, or MOCK_META_PORT)
//
// Control:
//   GET  /__control/calls            -> every recorded call so far
//   POST /__control/reset            -> forget calls, stop failing
//   POST /__control/fail {"on":true} -> message sends return HTTP 500
//   POST /__control/media {"id","path","mime"} -> serve a local file as Meta media `id`
import http from "node:http";
import fs from "node:fs";

const PORT = Number(process.env.MOCK_META_PORT ?? 8099);
let calls = [];
let failSends = false;
let n = 0;
const media = new Map();

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const raw = await readBody(req);
  const isJson = (req.headers["content-type"] ?? "").includes("application/json");
  let body = null;
  if (isJson && raw.length) {
    try {
      body = JSON.parse(raw.toString());
    } catch {
      body = null;
    }
  }

  // ---- control ----
  if (url.pathname === "/__control/calls") return json(res, 200, { calls });
  if (url.pathname === "/__control/reset") {
    calls = [];
    failSends = false;
    return json(res, 200, { ok: true });
  }
  if (url.pathname === "/__control/fail") {
    failSends = Boolean(body?.on);
    return json(res, 200, { failSends });
  }
  if (url.pathname === "/__control/media") {
    media.set(body.id, { path: body.path, mime: body.mime });
    return json(res, 200, { ok: true });
  }

  // ---- served media bytes (what Meta's lookaside URL would return) ----
  if (url.pathname.startsWith("/files/")) {
    const item = media.get(decodeURIComponent(url.pathname.slice(7)));
    if (!item) return json(res, 404, { error: "no such media" });
    res.writeHead(200, { "content-type": item.mime });
    return res.end(fs.readFileSync(item.path));
  }

  const call = { method: req.method, path: url.pathname, at: Date.now(), body: body ?? (raw.length ? `<${raw.length} bytes>` : null) };
  calls.push(call);

  // ---- Graph API ----
  if (req.method === "POST" && url.pathname.endsWith("/messages")) {
    if (body?.status === "read") return json(res, 200, { success: true });
    if (failSends) return json(res, 500, { error: { message: "mock failure", code: 1 } });
    n += 1;
    return json(res, 200, { messaging_product: "whatsapp", messages: [{ id: `wamid.MOCK${Date.now()}${n}` }] });
  }
  if (req.method === "POST" && url.pathname.endsWith("/media")) {
    n += 1;
    return json(res, 200, { id: `media.MOCK${n}` });
  }
  if (req.method === "GET" && url.pathname.endsWith("/message_templates")) return json(res, 200, { data: [] });
  if (req.method === "GET") {
    const id = url.pathname.split("/").pop();
    const item = media.get(id);
    if (item) {
      return json(res, 200, {
        url: `http://127.0.0.1:${PORT}/files/${encodeURIComponent(id)}`,
        mime_type: item.mime,
        file_size: fs.statSync(item.path).size,
      });
    }
  }
  return json(res, 404, { error: "mock: unhandled" });
});

server.listen(PORT, "127.0.0.1", () => console.log(`mock Meta listening on http://127.0.0.1:${PORT}`));
