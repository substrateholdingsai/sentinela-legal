import { ingestDof } from "./ingestors/dof";
import { ingestSat } from "./ingestors/sat";
import { analyzeItem } from "./ai/analyzer";
import { insertEvent, getEventBySourceId } from "./lib/db";
import { dispatchEvent } from "./webhook/dispatcher";
import { generateId } from "./lib/crypto";
import type { IngestedItem } from "./types";

export async function runPipeline(env: Env): Promise<{ processed: number; skipped: number }> {
  const kv = env.KV;
  const items: IngestedItem[] = [];
  const dofItems = await ingestDof();
  const satItems = await ingestSat();
  items.push(...dofItems, ...satItems);

  let processed = 0;
  let skipped = 0;
  for (const item of items) {
    const dedupKey = `seen:${item.source}:${item.source_id}`;
    const seen = await kv.get(dedupKey);
    if (seen) { skipped++; continue; }
    const existing = await getEventBySourceId(env.DB, item.source_id);
    if (existing) { await kv.put(dedupKey, "1", { expirationTtl: 60 * 60 * 24 * 30 }); skipped++; continue; }

    const analysis = await analyzeItem(env.AI, item);
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
      await dispatchEvent(env, inserted);
    }
    await kv.put(dedupKey, "1", { expirationTtl: 60 * 60 * 24 * 30 });
    processed++;
  }
  return { processed, skipped };
}
