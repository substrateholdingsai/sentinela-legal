import { Hono } from "hono";
import { createSubscriber, listSubscribers, listEvents } from "./lib/db";
import { runPipeline } from "./pipeline";
import { requireApiKey } from "./lib/auth";
import { sendCode, verifyCode, issueJwt, verifyJwt, createRefresh, rotateRefresh, revokeJwt } from "./lib/auth-sovereign";
import { LANDING_HTML } from "./landing/page";

const app = new Hono<{ Bindings: Env; Variables: { tenantId: string } }>();

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

app.use("/api/v1/*", requireApiKey);

app.post("/api/v1/subscribers", async (c) => {
  const body = await c.req.json<any>();
  if (!body?.name || !body?.email || !Array.isArray(body?.channels)) {
    return c.json({ error: "name, email, channels required" }, 400);
  }
  const tenantId = (c.get("tenantId") as string) || "default";
  const sub = await createSubscriber(c.env.DB, {
    tenant_id: tenantId,
    name: body.name,
    email: body.email,
    channels: body.channels,
    webhook_url: body.webhook_url,
    webhook_secret: body.webhook_secret,
  });
  return c.json(sub, 201);
});

app.get("/api/v1/subscribers", async (c) => {
  const tenantId = (c.get("tenantId") as string) || "default";
  const subs = await listSubscribers(c.env.DB, tenantId);
  return c.json({ subscribers: subs });
});

app.get("/api/v1/events", async (c) => {
  const events = await listEvents(c.env.DB, {
    channel: c.req.query("channel"),
    from: c.req.query("from"),
    to: c.req.query("to"),
    limit: c.req.query("limit") ? Number(c.req.query("limit")) : undefined,
  });
  return c.json({ events });
});

app.post("/api/v1/run", async (c) => {
  const result = await runPipeline(c.env);
  return c.json(result);
});

app.post("/auth/request-code", async (c) => {
  const body = await c.req.json<any>();
  if (!body?.email) return c.json({ error: "email required" }, 400);
  await sendCode(c.env, body.email);
  return c.json({ ok: true });
});

app.post("/auth/verify", async (c) => {
  const body = await c.req.json<any>();
  if (!body?.email || !body?.code) return c.json({ error: "email, code required" }, 400);
  const userId = await verifyCode(c.env, body.email, body.code);
  if (!userId) return c.json({ error: "invalid code" }, 401);
  const jwt = await issueJwt(c.env, userId, body.email);
  const refresh = await createRefresh(c.env, userId);
  return c.json({ token: jwt, refresh_token: refresh });
});

app.post("/auth/refresh", async (c) => {
  const body = await c.req.json<any>();
  if (!body?.refresh_token) return c.json({ error: "refresh_token required" }, 400);
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
