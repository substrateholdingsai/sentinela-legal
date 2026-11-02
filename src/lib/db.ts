import type { RegulatoryEvent, Subscriber, Channel, Tenant } from "../types";
import { generateId, hmacSha256Hex } from "./crypto";

export async function insertEvent(db: D1Database, ev: Omit<RegulatoryEvent, "created_at"> & { created_at?: string }): Promise<void> {
  await db
    .prepare(
      `INSERT OR IGNORE INTO regulatory_events (id, source, source_url, source_id, channel, title, summary, severity, effective_date, laws_affected, raw_snippet, action_required, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now')))`
    )
    .bind(
      ev.id,
      ev.source,
      ev.source_url,
      ev.source_id,
      ev.channel,
      ev.title,
      ev.summary,
      ev.severity,
      ev.effective_date,
      JSON.stringify(ev.laws_affected ?? []),
      ev.raw_snippet,
      ev.action_required ?? null,
      ev.created_at ?? null
    )
    .run();
}

export async function getEventBySourceId(db: D1Database, sourceId: string): Promise<RegulatoryEvent | null> {
  const row = await db.prepare("SELECT * FROM regulatory_events WHERE source_id = ?").bind(sourceId).first<any>();
  if (!row) return null;
  return rowToEvent(row);
}

export async function listEvents(db: D1Database, opts: { channel?: string; from?: string; to?: string; limit?: number; offset?: number } = {}): Promise<RegulatoryEvent[]> {
  const conds: string[] = [];
  const binds: any[] = [];
  if (opts.channel) { conds.push("channel = ?"); binds.push(opts.channel); }
  if (opts.from) { conds.push("created_at >= ?"); binds.push(opts.from); }
  if (opts.to) { conds.push("created_at <= ?"); binds.push(opts.to); }
  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  const rawLimit = opts.limit;
  const limit = Number.isInteger(rawLimit) ? Math.min(Math.max(rawLimit as number, 1), 200) : 50;
  const rawOffset = opts.offset;
  const offset = Number.isInteger(rawOffset) && (rawOffset as number) >= 0 ? (rawOffset as number) : 0;
  const q = `SELECT * FROM regulatory_events ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  binds.push(limit, offset);
  const res = await db.prepare(q).bind(...binds).all<any>();
  return (res.results ?? []).map(rowToEvent);
}

export async function listSubscribers(db: D1Database, tenantId?: string, activeOnly = true): Promise<Subscriber[]> {
  const conds: string[] = [];
  const binds: any[] = [];
  if (tenantId) { conds.push("tenant_id = ?"); binds.push(tenantId); }
  if (activeOnly) conds.push("active = 1");
  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  const q = `SELECT * FROM subscribers ${where}`;
  const res = await db.prepare(q).bind(...binds).all<any>();
  return (res.results ?? []).map(rowToSubscriber);
}

export async function getSubscriber(db: D1Database, id: string, tenantId?: string): Promise<Subscriber | null> {
  const q = tenantId ? "SELECT * FROM subscribers WHERE id = ? AND tenant_id = ?" : "SELECT * FROM subscribers WHERE id = ?";
  const binds = tenantId ? [id, tenantId] : [id];
  const row = await db.prepare(q).bind(...binds).first<any>();
  return row ? rowToSubscriber(row) : null;
}

export async function createSubscriber(db: D1Database, data: { tenant_id?: string; name: string; email: string; channels: Channel[]; webhook_url?: string; webhook_secret?: string }): Promise<Subscriber> {
  const id = generateId("sub");
  const tenantId = data.tenant_id ?? "default";
  const secret = data.webhook_secret ?? await hmacSha256Hex(crypto.randomUUID(), id);
  await db
    .prepare(
      `INSERT INTO subscribers (id, tenant_id, name, email, channels, webhook_url, webhook_secret, active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
    )
    .bind(id, tenantId, data.name, data.email, JSON.stringify(data.channels), data.webhook_url ?? null, secret)
    .run();
  const sub = await getSubscriber(db, id, tenantId);
  return sub!;
}

export async function logDelivery(db: D1Database, delivery: { id: string; subscriber_id: string; event_id: string; status_code: number | null; response_body: string | null }): Promise<void> {
  await db
    .prepare(
      `INSERT INTO webhook_deliveries (id, subscriber_id, event_id, status_code, response_body) VALUES (?, ?, ?, ?, ?)`
    )
    .bind(delivery.id, delivery.subscriber_id, delivery.event_id, delivery.status_code, delivery.response_body)
    .run();
}

function rowToEvent(row: any): RegulatoryEvent {
  let laws: string[] = [];
  try { laws = JSON.parse(row.laws_affected || "[]"); } catch { laws = []; }
  return {
    id: row.id,
    source: row.source,
    source_url: row.source_url,
    source_id: row.source_id,
    channel: row.channel,
    title: row.title,
    summary: row.summary,
    severity: row.severity,
    effective_date: row.effective_date,
    laws_affected: laws,
    raw_snippet: row.raw_snippet,
    action_required: row.action_required,
    created_at: row.created_at,
  };
}

function rowToSubscriber(row: any): Subscriber {
  let channels: Channel[] = [];
  try { channels = JSON.parse(row.channels || "[]"); } catch { channels = []; }
  return {
    id: row.id,
    tenant_id: row.tenant_id ?? "default",
    name: row.name,
    email: row.email,
    channels,
    webhook_url: row.webhook_url,
    webhook_secret: row.webhook_secret,
    active: row.active,
    created_at: row.created_at,
  };
}

export async function createTenant(db: D1Database, data: { name: string; slug: string }): Promise<Tenant> {
  const id = generateId("ten");
  await db.prepare(`INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?)`).bind(id, data.name, data.slug).run();
  const t = await getTenant(db, id);
  return t!;
}

export async function getTenant(db: D1Database, id: string): Promise<Tenant | null> {
  const row = await db.prepare("SELECT * FROM tenants WHERE id = ?").bind(id).first<any>();
  if (!row) return null;
  return { id: row.id, name: row.name, slug: row.slug, active: row.active, created_at: row.created_at };
}

export async function getTenantBySlug(db: D1Database, slug: string): Promise<Tenant | null> {
  const row = await db.prepare("SELECT * FROM tenants WHERE slug = ?").bind(slug).first<any>();
  if (!row) return null;
  return { id: row.id, name: row.name, slug: row.slug, active: row.active, created_at: row.created_at };
}
