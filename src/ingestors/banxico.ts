import { classifyChannel } from "./keywords";
import type { IngestedItem } from "../types";

export const BANXICO_NORMATIVA_URL = "https://www.banxico.org.mx/marco-normativo/normativa-agrupada-por-ano-cr.html";

export async function ingestBanxico(fetchFn: typeof fetch = fetch): Promise<IngestedItem[]> {
  const items: IngestedItem[] = [];
  try {
    const res = await fetchFn(BANXICO_NORMATIVA_URL, {
      headers: {
        "User-Agent": "Sentinela/1.0 (RegTech Observability; pavel@arksystems.site)",
        "Accept": "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return items;
    const html = await res.text();

    // Match <tr> elements inside the table
    const rowRegex = /<tr>[\s\S]*?<\/tr>/gi;
    const rows = html.match(rowRegex) || [];

    for (const row of rows) {
      // Find the circular link and number
      const linkMatch = row.match(/<td[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/td>/i);
      if (!linkMatch) continue;

      const rawHref = linkMatch[1].trim();
      const circularNum = linkMatch[2].replace(/<[^>]+>/g, "").trim();

      // Find the subject cell (second td)
      const tdMatches = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
      let subject = "";
      if (tdMatches.length >= 2) {
        subject = tdMatches[1][1].replace(/<[^>]+>/g, "").trim();
      }

      if (!circularNum || !rawHref) continue;

      const title = `Circular ${circularNum}${subject ? `: ${subject}` : ""}`;
      const sourceUrl = rawHref.startsWith("http") ? rawHref : `https://www.banxico.org.mx${rawHref}`;
      const cleanNum = circularNum.replace(/[^a-zA-Z0-9_-]/g, "_");
      const sourceId = `banxico_circ_${cleanNum}`;

      const combined = `${title} ${subject} banxico circular spei pagos credito`;
      const channel = classifyChannel(combined) || "fintech_banca";

      items.push({
        source: "BANXICO",
        source_url: sourceUrl,
        source_id: sourceId,
        title,
        raw_snippet: `${title}. Disposición regulatoria emitida por el Banco de México. Asunto: ${subject || "Normativa Financiera"}`.trim(),
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
