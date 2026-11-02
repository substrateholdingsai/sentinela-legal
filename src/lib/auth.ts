import type { Context, Next } from "hono";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function rateLimitKV(env: Env, key: string, limit: number, windowSec: number): Promise<boolean> {
  if (!env.KV) return true;
  try {
    const now = Math.floor(Date.now() / 1000);
    const raw = await env.KV.get(key);
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
    if (count > limit) return false;
    await env.KV.put(key, JSON.stringify({ count, reset }), { expirationTtl: windowSec });
    return true;
  } catch {
    return true;
  }
}

export async function requireApiKey(c: Context<{ Bindings: Env; Variables: { tenantId: string } }>, next: Next) {
  const adminKey = c.env.ADMIN_API_KEY ?? c.env.ADMIN_KEY ?? "dev-admin-key";
  if (!c.env.ADMIN_API_KEY && !c.env.ADMIN_KEY) {
    console.warn("[AUTH WARNING] ADMIN_API_KEY is not configured in environment. Using fallback 'dev-admin-key'.");
  }

  const auth = c.req.header("authorization") || "";
  const xApiKey = c.req.header("x-api-key") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : (xApiKey ? xApiKey.trim() : "");

  if (!token || !safeEqual(token, adminKey)) {
    return c.json({ error: "Unauthorized: Invalid or missing API key" }, 401);
  }

  const tenantId = c.req.header("x-tenant-id") || c.req.query("tenant_id") || "default";
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(tenantId)) {
    return c.json({ error: "Invalid tenant id" }, 400);
  }
  c.set("tenantId", tenantId);

  // Rate limit per tenant+key+ip via KV (60 req/min)
  const ip = c.req.header("cf-connecting-ip") || "unknown";
  const rlKey = `rl:api:${tenantId}:${ip}`;
  const allowed = await rateLimitKV(c.env, rlKey, 60, 60);
  if (!allowed) {
    c.header("Retry-After", "60");
    return c.json({ error: "Rate limit exceeded" }, 429);
  }

  await next();
}
