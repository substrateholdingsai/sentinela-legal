CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  api_key_hash TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE subscribers ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';

CREATE INDEX IF NOT EXISTS idx_subscribers_tenant ON subscribers(tenant_id);

INSERT OR IGNORE INTO tenants (id, name, slug) VALUES ('default', 'Default Tenant', 'default');
