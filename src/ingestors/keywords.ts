import type { IngestedItem, Source, Channel } from "../types";

const KEYWORDS: Record<Channel, RegExp[]> = {
  fiscal: [/sat\b/i, /impuesto/i, /deducci/i, /facturaci/i, /cfdi/i, /resoluci.n miscel/i, /69-?b/i],
  cobranza: [/condusef/i, /redeco/i, /284\s*bis/i, /nom-?184/i, /cobranza/i],
  fintech_banca: [/cnbv/i, /banxico/i, /pld/i, /lavado/i, /fintech/i, /banca/i],
  laboral: [/stps/i, /salario m.nimo/i, /imss/i, /infonavit/i, /laboral/i, /trabajo/i],
};

export function classifyChannel(text: string): Channel | null {
  const scores: Record<Channel, number> = { fiscal: 0, cobranza: 0, fintech_banca: 0, laboral: 0 };
  for (const ch of Object.keys(KEYWORDS) as Channel[]) {
    for (const re of KEYWORDS[ch]) {
      if (re.test(text)) scores[ch]++;
    }
  }
  let best: Channel | null = null;
  let max = 0;
  for (const ch of Object.keys(scores) as Channel[]) {
    if (scores[ch] > max) {
      max = scores[ch];
      best = ch;
    }
  }
  return max > 0 ? best : null;
}

export function parseRssItems(xml: string, source: Source): IngestedItem[] {
  const items: IngestedItem[] = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const matches = xml.match(itemRegex) || [];
  for (const m of matches) {
    const title = (m.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/<!\[CDATA\[|\]\]>/g, "").trim();
    const link = (m.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] || "").trim();
    const desc = (m.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] || "").replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim();
    const guid = (m.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)?.[1] || link || title).trim();
    if (!title) continue;
    const combined = `${title} ${desc}`;
    const channel = classifyChannel(combined);
    if (!channel) continue;
    items.push({
      source,
      source_url: link,
      source_id: guid,
      title,
      raw_snippet: desc.slice(0, 2000),
      channel_hint: channel,
    });
  }
  return items;
}
