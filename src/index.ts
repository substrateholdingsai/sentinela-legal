import { Hono } from "hono";
import { createSubscriber, listSubscribers, listEvents } from "./lib/db";
import { runPipeline } from "./pipeline";
import { requireApiKey, rateLimitKV } from "./lib/auth";
import { sendCode, verifyCode, issueJwt, verifyJwt, createRefresh, rotateRefresh, revokeJwt } from "./lib/auth-sovereign";
import { LANDING_HTML } from "./landing/page";
import { DOF_RSS_URL } from "./ingestors/dof";
import { parseDofFeed } from "./ingestors/dof-feed";
import { sha256Hex } from "./lib/crypto";

const app = new Hono<{ Bindings: Env; Variables: { tenantId: string } }>();

const ALLOWED_CHANNELS = new Set(["fiscal", "cobranza", "fintech_banca", "laboral"]);

function isValidEmail(email: string): boolean {
  return typeof email === "string" && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isSafeWebhookUrl(raw: string): boolean {
  let url: URL;
  try { url = new URL(raw); } catch { return false; }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  const host = url.hostname.toLowerCase();
  if (!host || host === "localhost" || host.endsWith(".localhost")) return false;
  if (host === "127.0.0.1" || host === "::1" || host === "0.0.0.0") return false;
  if (host === "169.254.169.254" || host === "metadata.google.internal") return false;
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) return false;
  return true;
}

async function parseJson(c: any): Promise<any | null> {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
}

// Security headers + request size guard
app.use("*", async (c, next) => {
  const cl = c.req.header("content-length");
  if (cl && Number(cl) > 65536) {
    return c.json({ error: "Payload too large" }, 413);
  }
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  c.header("X-XSS-Protection", "0");
});

app.get("/", (c) => {
  const accept = c.req.header("accept") || "";
  const format = c.req.query("format");
  if (format === "html" || (accept.includes("text/html") && format !== "json")) {
    return c.html(LANDING_HTML);
  }
  return c.json({ name: "sentinela", status: "ok" });
});

app.get("/landing", (c) => c.html(LANDING_HTML));

app.get("/health", (c) => c.json({ name: "sentinela", status: "ok" }));

app.get("/api/public/dof/latest", async (c) => {
  const ip = c.req.header("cf-connecting-ip") || "unknown";
  const allowed = await rateLimitKV(c.env, `rl:public:dof:${ip}`, 30, 60);
  if (!allowed) {
    c.header("Retry-After", "60");
    return c.json({ error: "Rate limit exceeded" }, 429);
  }

  const cacheKey = "public:dof:latest:v1";
  const cached = await c.env.KV.get(cacheKey);
  if (cached) {
    try {
      const payload = JSON.parse(cached);
      if (Array.isArray(payload.items) && typeof payload.updatedAt === "string") {
        return c.json(payload, 200, { "Cache-Control": "public, max-age=300" });
      }
      console.warn("DOF feed cache contained an unexpected payload");
    } catch (error) {
      console.warn("Unable to parse cached DOF feed", error);
    }
  }

  let xml: string;
  try {
    const response = await fetch(DOF_RSS_URL, { headers: { "User-Agent": "Sentinela/1.0" } });
    if (!response.ok) {
      console.error(`The official DOF feed returned HTTP ${response.status}`);
      return c.json({ error: "El feed oficial del DOF no está disponible en este momento." }, 502);
    }
    xml = await response.text();
  } catch (error) {
    console.error("Unable to fetch the official DOF feed", error);
    return c.json({ error: "No fue posible consultar el feed oficial del DOF." }, 502);
  }

  const items = parseDofFeed(xml).slice(0, 5);
  const payload = { items, updatedAt: new Date().toISOString() };
  await c.env.KV.put(cacheKey, JSON.stringify(payload), { expirationTtl: 300 });
  return c.json(payload, 200, { "Cache-Control": "public, max-age=300" });
});

app.use("/api/v1/*", requireApiKey);

app.post("/api/v1/subscribers", async (c) => {
  const body = await parseJson(c);
  if (!body) return c.json({ error: "invalid JSON" }, 400);
  if (!body?.name || !body?.email || !Array.isArray(body?.channels)) {
    return c.json({ error: "name, email, channels required" }, 400);
  }
  if (typeof body.name !== "string" || body.name.trim().length === 0 || body.name.length > 120) {
    return c.json({ error: "invalid name" }, 400);
  }
  if (!isValidEmail(body.email)) {
    return c.json({ error: "invalid email" }, 400);
  }
  if (!body.channels.every((ch: any) => typeof ch === "string" && ALLOWED_CHANNELS.has(ch))) {
    return c.json({ error: "invalid channels" }, 400);
  }
  if (body.webhook_url !== undefined && body.webhook_url !== null) {
    if (typeof body.webhook_url !== "string" || !isSafeWebhookUrl(body.webhook_url)) {
      return c.json({ error: "invalid webhook_url" }, 400);
    }
  }
  if (body.webhook_secret !== undefined && body.webhook_secret !== null) {
    if (typeof body.webhook_secret !== "string" || body.webhook_secret.length < 16 || body.webhook_secret.length > 256) {
      return c.json({ error: "invalid webhook_secret" }, 400);
    }
  }

  const tenantId = (c.get("tenantId") as string) || "default";
  const sub = await createSubscriber(c.env.DB, {
    tenant_id: tenantId,
    name: body.name.trim(),
    email: body.email.trim(),
    channels: body.channels,
    webhook_url: body.webhook_url ?? undefined,
    webhook_secret: body.webhook_secret ?? undefined,
  });
  const { webhook_secret, ...safe } = sub as any;
  return c.json({ ...safe, webhook_secret }, 201);
});

app.get("/api/v1/subscribers", async (c) => {
  const tenantId = (c.get("tenantId") as string) || "default";
  const subs = await listSubscribers(c.env.DB, tenantId);
  const safe = subs.map((s: any) => {
    const { webhook_secret, ...rest } = s;
    return rest;
  });
  return c.json({ subscribers: safe });
});

app.get("/api/v1/events", async (c) => {
  const channel = c.req.query("channel");
  if (channel && !ALLOWED_CHANNELS.has(channel)) {
    return c.json({ error: "invalid channel" }, 400);
  }
  const from = c.req.query("from");
  const to = c.req.query("to");
  const limitRaw = c.req.query("limit");
  let limit: number | undefined;
  if (limitRaw) {
    const n = Number(limitRaw);
    if (!Number.isInteger(n) || n < 1 || n > 200) {
      return c.json({ error: "invalid limit" }, 400);
    }
    limit = n;
  }
  const offsetRaw = c.req.query("offset");
  let offset: number | undefined;
  if (offsetRaw) {
    const n = Number(offsetRaw);
    if (!Number.isInteger(n) || n < 0) {
      return c.json({ error: "invalid offset" }, 400);
    }
    offset = n;
  }
  const events = await listEvents(c.env.DB, { channel, from, to, limit, offset });

  const body = JSON.stringify({ events });
  const etag = `"${await sha256Hex(body)}"`;
  const inm = c.req.header("if-none-match");
  if (inm && inm === etag) {
    return c.body(null, 304, { ETag: etag, "Cache-Control": "private, max-age=60" });
  }
  return c.json({ events }, 200, { ETag: etag, "Cache-Control": "private, max-age=60" });
});

app.post("/api/v1/run", async (c) => {
  const result = await runPipeline(c.env);
  return c.json(result);
});

app.post("/auth/request-code", async (c) => {
  const ip = c.req.header("cf-connecting-ip") || "unknown";
  const body = await parseJson(c);
  if (!body) return c.json({ error: "invalid JSON" }, 400);
  if (!body?.email) return c.json({ error: "email required" }, 400);
  if (!isValidEmail(body.email)) return c.json({ error: "invalid email" }, 400);

  const ipAllowed = await rateLimitKV(c.env, `rl:auth:ip:${ip}`, 20, 600);
  if (!ipAllowed) {
    c.header("Retry-After", "600");
    return c.json({ error: "Too many requests" }, 429);
  }

  const allowed = await rateLimitKV(c.env, `rl:auth:req:${ip}:${body.email}`, 5, 600);
  if (!allowed) {
    c.header("Retry-After", "600");
    return c.json({ error: "Too many requests" }, 429);
  }

  await sendCode(c.env, body.email);
  return c.json({ ok: true });
});

app.post("/auth/verify", async (c) => {
  const ip = c.req.header("cf-connecting-ip") || "unknown";
  const body = await parseJson(c);
  if (!body) return c.json({ error: "invalid JSON" }, 400);
  if (!body?.email || !body?.code) return c.json({ error: "email, code required" }, 400);
  if (!isValidEmail(body.email)) return c.json({ error: "invalid email" }, 400);
  if (typeof body.code !== "string" || !/^\d{6}$/.test(body.code)) {
    return c.json({ error: "invalid code" }, 400);
  }

  const ipAllowed = await rateLimitKV(c.env, `rl:auth:ip:${ip}`, 20, 600);
  if (!ipAllowed) {
    c.header("Retry-After", "600");
    return c.json({ error: "Too many requests" }, 429);
  }

  const allowed = await rateLimitKV(c.env, `rl:auth:verify:${ip}:${body.email}`, 10, 600);
  if (!allowed) {
    c.header("Retry-After", "600");
    return c.json({ error: "Too many requests" }, 429);
  }

  const userId = await verifyCode(c.env, body.email, body.code);
  if (!userId) return c.json({ error: "invalid code" }, 401);
  const jwt = await issueJwt(c.env, userId, body.email);
  const refresh = await createRefresh(c.env, userId);
  return c.json({ token: jwt, refresh_token: refresh });
});

app.post("/auth/refresh", async (c) => {
  const body = await parseJson(c);
  if (!body) return c.json({ error: "invalid JSON" }, 400);
  if (!body?.refresh_token) return c.json({ error: "refresh_token required" }, 400);
  if (typeof body.refresh_token !== "string" || body.refresh_token.length < 10) {
    return c.json({ error: "invalid refresh_token" }, 400);
  }
  const res = await rotateRefresh(c.env, body.refresh_token);
  if (!res) return c.json({ error: "invalid refresh" }, 401);
  const user = await c.env.DB.prepare("SELECT email FROM auth_users WHERE id = ?").bind(res.userId).first<any>();
  const jwt = await issueJwt(c.env, res.userId, user?.email ?? "");
  return c.json({ token: jwt, refresh_token: res.newRefresh });
});

app.post("/auth/logout", async (c) => {
  const auth = c.req.header("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const payload = await verifyJwt(c.env, token);
  if (payload) await revokeJwt(c.env, payload.jti, Math.floor(Date.now() / 1000) + 3600);
  return c.json({ ok: true });
});

export default {
  fetch: app.fetch,
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runPipeline(env));
  },
} satisfies ExportedHandler<Env>;
