import { classifyChannel } from "./keywords";
import type { IngestedItem, Source } from "../types";

export const SAT_PAGE_URL = "https://www.sat.gob.mx/portal/public/tramites-y-servicios";

export async function ingestSat(fetchFn: typeof fetch = fetch): Promise<IngestedItem[]> {
  const items: IngestedItem[] = [];
  try {
    const res = await fetchFn("https://www.sat.gob.mx/", { headers: { "User-Agent": "Sentinela/1.0" } });
    if (!res.ok) return items;
    const html = await res.text();
    const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = linkRegex.exec(html)) !== null) {
      const href = m[1];
      const text = m[2].replace(/<[^>]+>/g, "").trim();
      if (!text || text.length < 15) continue;
      const combined = `${text} ${href}`;
      const channel = classifyChannel(combined + " sat impuesto fiscal cfdi");
      // Only include items that look regulatory
      if (!/sat|impuesto|fiscal|cfdi|deducci|miscel/i.test(combined)) continue;
      items.push({
        source: "SAT",
        source_url: href.startsWith("http") ? href : `https://www.sat.gob.mx${href}`,
        source_id: href,
        title: text,
        raw_snippet: text,
        channel_hint: channel || "fiscal",
      });
    }
  } catch {
    // ignore
  }
  // dedupe by source_id
  const seen = new Set<string>();
  return items.filter((i) => {
    if (seen.has(i.source_id)) return false;
    seen.add(i.source_id);
    return true;
  });
}
