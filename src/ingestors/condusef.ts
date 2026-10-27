import { classifyChannel } from "./keywords";
import type { IngestedItem } from "../types";

export const CONDUSEF_PRENSA_URL = "https://www.gob.mx/condusef/archivo/prensa";

export async function ingestCondusef(fetchFn: typeof fetch = fetch): Promise<IngestedItem[]> {
  const items: IngestedItem[] = [];
  try {
    const res = await fetchFn(CONDUSEF_PRENSA_URL, {
      headers: {
        "User-Agent": "Sentinela/1.0 (RegTech Observability; pavel@arksystems.site)",
        "Accept": "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return items;
    const html = await res.text();

    // Parse gob.mx <article> blocks
    const articleRegex = /<article[\s\S]*?<\/article>/gi;
    const articles = html.match(articleRegex) || [];

    for (const article of articles) {
      const titleMatch = article.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
      const linkMatch = article.match(/<a[^>]*class="[^"]*small-link[^"]*"[^>]*href="([^"]+)"/i) ||
                         article.match(/<a[^>]*href="([^"]*\/condusef\/prensa\/[^"]*)"/i);
      const timeMatch = article.match(/<time[^>]*datetime="([^"]+)"[^>]*>([\s\S]*?)<\/time>/i);

      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";
      const rawHref = linkMatch ? linkMatch[1].trim() : "";
      const timeStr = timeMatch ? timeMatch[1].trim() : "";

      if (!title || !rawHref) continue;

      const sourceUrl = rawHref.startsWith("http") ? rawHref : `https://www.gob.mx${rawHref}`;
      // Clean source_id without tracking params
      const sourceId = rawHref.split("?")[0].replace(/^\/condusef\/prensa\//, "") || rawHref;

      const combined = `${title} ${timeStr} condusef redeco cobranza financiero`;
      const channel = classifyChannel(combined) || "cobranza";

      items.push({
        source: "CONDUSEF",
        source_url: sourceUrl,
        source_id: `condusef_${sourceId}`,
        title,
        raw_snippet: `${title}. Publicado el: ${timeStr}`.trim(),
        channel_hint: channel,
      });
    }
  } catch {
    // Fail silently on network errors
  }

  // Deduplicate by source_id
  const seen = new Set<string>();
  return items.filter((i) => {
    if (seen.has(i.source_id)) return false;
    seen.add(i.source_id);
    return true;
  });
}
