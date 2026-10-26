import { Hono } from "hono";
import { createSubscriber, listEvents } from "./lib/db";
import { runPipeline } from "./pipeline";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.json({ name: "sentinela", status: "ok" }));

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
