interface Env {
  DB: D1Database;
  KV: KVNamespace;
  AI: Ai;
  ADMIN_API_KEY?: string;
  ADMIN_KEY?: string;
  MAX_PIPELINE_ITEMS?: string;
}
