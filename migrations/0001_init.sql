CREATE TABLE IF NOT EXISTS regulatory_events (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_id TEXT UNIQUE NOT NULL,
  channel TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  severity TEXT NOT NULL,
  effective_date TEXT,
  laws_affected TEXT,
  raw_snippet TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  channels TEXT NOT NULL,
  webhook_url TEXT,
  webhook_secret TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id TEXT PRIMARY KEY,
  subscriber_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  status_code INTEGER,
  response_body TEXT,
  delivered_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (subscriber_id) REFERENCES subscribers(id),
  FOREIGN KEY (event_id) REFERENCES regulatory_events(id)
);

CREATE INDEX IF NOT EXISTS idx_events_created ON regulatory_events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_channel ON regulatory_events(channel);
CREATE INDEX IF NOT EXISTS idx_events_severity ON regulatory_events(severity);
