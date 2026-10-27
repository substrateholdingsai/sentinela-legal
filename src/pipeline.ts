import { ingestDof } from "./ingestors/dof";
import { ingestSat } from "./ingestors/sat";
import { ingestCondusef } from "./ingestors/condusef";
import { ingestCnbv } from "./ingestors/cnbv";
import { ingestBanxico } from "./ingestors/banxico";
import { analyzeItem } from "./ai/analyzer";
import { insertEvent, getEventBySourceId } from "./lib/db";
import { dispatchEvent } from "./webhook/dispatcher";
import { generateId } from "./lib/crypto";
import type { IngestedItem } from "./types";

export interface PipelineOptions {
  maxItems?: number;
}

const DEFAULT_MAX_ITEMS = 25;
const CONCURRENCY = 3;
const ITEM_TIMEOUT_MS = 30000;
const AI_CACHE_TTL = 60 * 60 * 24 * 30;

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }).catch((e) => { clearTimeout(t); reject(e); });
  });
}

async function runPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function runPipeline(
  env: Env,
  options?: PipelineOptions
): Promise<{ processed: number; skipped: number; failed: number }> {
  const kv = env.KV;
  const items: IngestedItem[] = [];

  const [dof, sat, condusef, cnbv, banxico] = await Promise.allSettled([
    ingestDof(),
    ingestSat(),
    ingestCondusef(),
    ingestCnbv(),
    ingestBanxico(),
  ]);

  if (dof.status === "fulfilled") items.push(...dof.value);
  if (sat.status === "fulfilled") items.push(...sat.value);
  if (condusef.status === "fulfilled") items.push(...condusef.value);
  if (cnbv.status === "fulfilled") items.push(...cnbv.value);
  if (banxico.status === "fulfilled") items.push(...banxico.value);

  const envLimit = env.MAX_PIPELINE_ITEMS ? parseInt(env.MAX_PIPELINE_ITEMS, 10) : NaN;
  const maxItems = options?.maxItems ?? (!isNaN(envLimit) && envLimit > 0 ? envLimit : DEFAULT_MAX_ITEMS);

  // cap items
  const capped = items.slice(0, maxItems);

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  await runPool(capped, CONCURRENCY, async (item) => {
    const dedupKey = `seen:${item.source}:${item.source_id}`;
    const seen = await kv.get(dedupKey);
    if (seen) { skipped++; return; }
    const existing = await getEventBySourceId(env.DB, item.source_id);
    if (existing) { await kv.put(dedupKey, "1", { expirationTtl: AI_CACHE_TTL }); skipped++; return; }

    // AI cache
    const aiCacheKey = `ai:${item.source}:${item.source_id}`;
    let analysis: any = null;
    const cached = await kv.get(aiCacheKey);
    if (cached) {
      try { analysis = JSON.parse(cached); } catch { analysis = null; }
    }
    if (!analysis) {
      try {
        analysis = await withTimeout(analyzeItem(env.AI, item), ITEM_TIMEOUT_MS);
        await kv.put(aiCacheKey, JSON.stringify(analysis), { expirationTtl: AI_CACHE_TTL });
      } catch {
        failed++;
        return;
      }
    }

    const ev = {
      id: generateId("reg"),
      source: item.source,
      source_url: item.source_url,
      source_id: item.source_id,
      channel: analysis.channel,
      title: item.title,
      summary: analysis.summary,
      severity: analysis.severity,
      effective_date: analysis.effective_date,
      laws_affected: analysis.laws_affected,
      raw_snippet: item.raw_snippet,
      action_required: analysis.action_required,
    };
    await insertEvent(env.DB, ev as any);
    const inserted = await getEventBySourceId(env.DB, item.source_id);
    if (inserted) {
      // dispatch with timeout guard
      try { await withTimeout(dispatchEvent(env, inserted), 15000); } catch { /* ignore */ }
    }
    await kv.put(dedupKey, "1", { expirationTtl: AI_CACHE_TTL });
    processed++;
  });

  return { processed, skipped, failed };
}
