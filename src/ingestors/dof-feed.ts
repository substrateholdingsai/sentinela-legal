export interface DofFeedItem {
  title: string;
  url: string;
  summary: string;
  publishedAt: string | null;
}

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(parseInt(code, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function readTag(xml: string, tag: string): string {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return xml.match(new RegExp(`<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}\\s*>`, "i"))?.[1]?.trim() ?? "";
}

export function parseDofFeed(xml: string): DofFeedItem[] {
  const items: DofFeedItem[] = [];
  const matches = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item\s*>/gi) ?? [];

  for (const item of matches) {
    const title = decodeXml(readTag(item, "title")).trim();
    const rawUrl = decodeXml(readTag(item, "link")).trim();
    if (!title || !rawUrl) continue;

    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      continue;
    }
    if (url.protocol !== "https:" || !["dof.gob.mx", "www.dof.gob.mx"].includes(url.hostname)) continue;

    const rawDate = decodeXml(readTag(item, "pubDate") || readTag(item, "dc:date")).trim();
    const timestamp = rawDate ? Date.parse(rawDate) : NaN;
    const rawSummary = decodeXml(readTag(item, "description"))
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    items.push({
      title,
      url: url.toString(),
      summary: rawSummary.slice(0, 500),
      publishedAt: Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString(),
    });
  }

  return items;
}
