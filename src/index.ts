import { Hono } from "hono";
import { createSubscriber, listEvents } from "./lib/db";
import { runPipeline } from "./pipeline";
import { requireApiKey } from "./lib/auth";
import { LANDING_HTML } from "./landing/page";

const app = new Hono<{ Bindings: Env }>();

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
  const sub = await createSubscriber(c.env.DB, {
    name: body.name,
    email: body.email,
    channels: body.channels,
    webhook_url: body.webhook_url,
    webhook_secret: body.webhook_secret,
  });
  return c.json(sub, 201);
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

export default {
  fetch: app.fetch,
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runPipeline(env));
  },
} satisfies ExportedHandler<Env>;
