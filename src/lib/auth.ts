import type { Context, Next } from "hono";

export async function requireApiKey(c: Context<{ Bindings: Env; Variables: { tenantId: string } }>, next: Next) {
  const adminKey = c.env.ADMIN_API_KEY ?? c.env.ADMIN_KEY ?? "dev-admin-key";
  if (!c.env.ADMIN_API_KEY && !c.env.ADMIN_KEY) {
    console.warn("[AUTH WARNING] ADMIN_API_KEY is not configured in environment. Using fallback 'dev-admin-key'.");
  }

  const auth = c.req.header("authorization") || "";
  const xApiKey = c.req.header("x-api-key") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : (xApiKey ? xApiKey.trim() : "");

  if (!token || token !== adminKey) {
    return c.json({ error: "Unauthorized: Invalid or missing API key" }, 401);
  }

  const tenantId = c.req.header("x-tenant-id") || c.req.query("tenant_id") || "default";
  c.set("tenantId", tenantId);

  // Rate limit per tenant+key+ip via KV (60 req/min)
  if (c.env.KV) {
    try {
      const ip = c.req.header("cf-connecting-ip") || "unknown";
      const rlKey = `rl:${tenantId}:${token.slice(0, 8)}:${ip}`;
      const now = Math.floor(Date.now() / 1000);
      const windowSec = 60;
      const limit = 60;
      const raw = await c.env.KV.get(rlKey);
      let count = 0;
      let reset = now + windowSec;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.reset > now) {
            count = parsed.count;
            reset = parsed.reset;
          }
        } catch {
          // ignore parsing error
        }
      }
      count++;
      if (count > limit) {
        return c.json({ error: "Rate limit exceeded" }, 429);
      }
      await c.env.KV.put(rlKey, JSON.stringify({ count, reset }), { expirationTtl: windowSec });
    } catch {
      // Graceful fallback if KV is unavailable
    }
  }

  await next();
}
