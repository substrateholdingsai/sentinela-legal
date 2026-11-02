import { generateId, sha256Hex } from "./crypto";

const JWT_SECRET_ENV = "JWT_SECRET";
const RESEND_API_KEY_ENV = "RESEND_API_KEY";

function getSecret(env: Env): string {
  const secret = (env as any)[JWT_SECRET_ENV];
  if (!secret) console.warn("[AUTH WARNING] JWT_SECRET is not configured. Using insecure dev fallback.");
  return secret ?? "dev-jwt-secret";
}

async function hmacSign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacVerify(secret: string, data: string, sig: string): Promise<boolean> {
  const expected = await hmacSign(secret, data);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

function isValidEmail(email: string): boolean {
  return typeof email === "string" && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function secureCode(): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(100000 + (arr[0] % 900000));
}

export async function sendCode(env: Env, email: string): Promise<string> {
  if (!isValidEmail(email)) throw new Error("invalid email");
  const code = secureCode();
  const id = generateId("code");
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await env.DB.prepare("INSERT INTO auth_codes (id, email, code, expires_at) VALUES (?, ?, ?, ?)").bind(id, email, code, expires).run();
  const apiKey = (env as any)[RESEND_API_KEY_ENV];
  if (apiKey) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "no-reply@sentinela.local", to: email, subject: "Tu codigo Sentinela", html: `<p>Codigo: <b>${code}</b> (10 min)</p>` }),
    });
  }
  return code;
}

export async function verifyCode(env: Env, email: string, code: string): Promise<string | null> {
  if (!isValidEmail(email) || !/^\d{6}$/.test(code)) return null;
  const row = await env.DB.prepare("SELECT * FROM auth_codes WHERE email = ? AND code = ? AND used = 0").bind(email, code).first<any>();
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  await env.DB.prepare("UPDATE auth_codes SET used = 1 WHERE id = ?").bind(row.id).run();
  let user = await env.DB.prepare("SELECT * FROM auth_users WHERE email = ?").bind(email).first<any>();
  if (!user) {
    const id = generateId("usr");
    await env.DB.prepare("INSERT INTO auth_users (id, email) VALUES (?, ?)").bind(id, email).run();
    user = { id, email };
  }
  return user.id as string;
}

export function b64url(s: string): string {
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function issueJwt(env: Env, userId: string, email: string): Promise<string> {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify({ sub: userId, email, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600, jti: generateId("jti") }));
  const sig = await hmacSign(getSecret(env), `${header}.${payload}`);
  return `${header}.${payload}.${sig}`;
}

export async function verifyJwt(env: Env, token: string): Promise<{ sub: string; email: string; jti: string } | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const ok = await hmacVerify(getSecret(env), `${h}.${p}`, s);
  if (!ok) return null;
  try {
    const headerJson = JSON.parse(atob(h.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((h.length + 3) % 4)));
    if (headerJson?.alg !== "HS256" || headerJson?.typ !== "JWT") return null;
    const payload = JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((p.length + 3) % 4)));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    const revoked = await env.DB.prepare("SELECT 1 FROM revoked_tokens WHERE jti = ?").bind(payload.jti).first();
    if (revoked) return null;
    if (!payload.sub || !payload.jti) return null;
    return { sub: payload.sub, email: payload.email ?? "", jti: payload.jti };
  } catch {
    return null;
  }
}

export async function createRefresh(env: Env, userId: string): Promise<string> {
  const token = generateId("ref") + generateId("ref");
  const id = generateId("ses");
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const hash = await sha256Hex(token);
  await env.DB.prepare("INSERT INTO auth_sessions (id, user_id, refresh_token, expires_at) VALUES (?, ?, ?, ?)").bind(id, userId, hash, expires).run();
  return token;
}

export async function rotateRefresh(env: Env, refreshToken: string): Promise<{ userId: string; newRefresh: string } | null> {
  const hash = await sha256Hex(refreshToken);
  const row = await env.DB.prepare("SELECT * FROM auth_sessions WHERE refresh_token = ? AND revoked = 0").bind(hash).first<any>();
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  await env.DB.prepare("UPDATE auth_sessions SET revoked = 1 WHERE id = ?").bind(row.id).run();
  const newRefresh = await createRefresh(env, row.user_id);
  return { userId: row.user_id, newRefresh };
}

export async function revokeJwt(env: Env, jti: string, exp: number): Promise<void> {
  const expires = new Date(exp * 1000).toISOString();
  await env.DB.prepare("INSERT OR IGNORE INTO revoked_tokens (jti, expires_at) VALUES (?, ?)").bind(jti, expires).run();
}
