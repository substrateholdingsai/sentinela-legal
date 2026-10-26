import { parseRssItems } from "./keywords";
import type { IngestedItem } from "../types";

export const DOF_RSS_URL = "https://dof.gob.mx/rss/notas_nuevas.xml";

export async function ingestDof(fetchFn: typeof fetch = fetch): Promise<IngestedItem[]> {
  try {
    const res = await fetchFn(DOF_RSS_URL, { headers: { "User-Agent": "Sentinela/1.0" } });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRssItems(xml, "DOF");
  } catch {
    return [];
  }
}
