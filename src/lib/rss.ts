import { XMLParser } from "fast-xml-parser";

export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  timeAgo: string;
  description?: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

function computeTimeAgo(pubDate: string): string {
  const pub = new Date(pubDate);
  const now = new Date();
  const diffMs = now.getTime() - pub.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function extractSource(link: string, feedUrl: string): string {
  try {
    // For Google News, try to extract the actual source from the title
    if (feedUrl.includes("news.google.com")) {
      return "Google News";
    }
    const url = new URL(link);
    const hostname = url.hostname.replace("www.", "");
    // Map common hostnames to friendly names
    const sourceMap: Record<string, string> = {
      "feeds.npr.org": "NPR",
      "npr.org": "NPR",
      "feeds.bbci.co.uk": "BBC",
      "bbc.co.uk": "BBC",
      "bbc.com": "BBC",
      "feeds.nbcnews.com": "NBC News",
      "nbcnews.com": "NBC News",
      "thehill.com": "The Hill",
      "mprnews.org": "MPR News",
      "minnpost.com": "MinnPost",
      "minnesotareformer.com": "Minnesota Reformer",
      "bringmethenews.com": "Bring Me The News",
      "techcrunch.com": "TechCrunch",
      "arstechnica.com": "Ars Technica",
      "feeds.arstechnica.com": "Ars Technica",
      "venturebeat.com": "VentureBeat",
      "engadget.com": "Engadget",
      "aljazeera.com": "Al Jazeera",
      "dw.com": "DW",
      "rss.dw.com": "DW",
      "startribune.com": "Star Tribune",
      "twincities.com": "Pioneer Press",
      "kare11.com": "KARE11",
      "stillwatergazette.com": "Stillwater Gazette",
    };
    return sourceMap[hostname] || hostname;
  } catch {
    return "Unknown";
  }
}

function extractGoogleNewsSource(title: string): string {
  // Google News titles often end with " - Source Name"
  const match = title.match(/ - ([^-]+)$/);
  return match ? match[1].trim() : "Google News";
}

export async function fetchRSSFeed(
  feedUrl: string,
  maxAgeHours: number
): Promise<FeedItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(feedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "MorningBrief/1.0",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`RSS fetch failed for ${feedUrl}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    const parsed = parser.parse(xml);

    const items: FeedItem[] = [];
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    const isGoogleNews = feedUrl.includes("news.google.com");

    // Handle both RSS 2.0 and Atom feeds
    const rawItems =
      parsed?.rss?.channel?.item ||
      parsed?.feed?.entry ||
      [];

    const itemArray = Array.isArray(rawItems) ? rawItems : [rawItems];

    for (const item of itemArray) {
      const title = item.title?.toString() || "";
      const link =
        item.link?.["@_href"] || item.link?.toString() || "";
      const pubDate =
        item.pubDate || item.published || item.updated || "";

      if (!title || !link) continue;

      const pubDateObj = new Date(pubDate);
      if (pubDate && pubDateObj < cutoff) continue;

      const source = isGoogleNews
        ? extractGoogleNewsSource(title)
        : extractSource(link, feedUrl);

      // Clean Google News title (remove " - Source" suffix)
      const cleanTitle = isGoogleNews
        ? title.replace(/ - [^-]+$/, "").trim()
        : title;

      items.push({
        title: cleanTitle,
        link,
        pubDate: pubDate || new Date().toISOString(),
        source,
        timeAgo: computeTimeAgo(pubDate || new Date().toISOString()),
        description:
          item.description?.toString()?.replace(/<[^>]*>/g, "")?.slice(0, 300) ||
          "",
      });
    }

    return items;
  } catch (error) {
    console.error(`Error fetching RSS feed ${feedUrl}:`, error);
    return [];
  }
}

export async function fetchAllFeeds(
  feeds: string[],
  maxAgeHours: number
): Promise<FeedItem[]> {
  const allItems: FeedItem[] = [];

  // Fetch feeds sequentially with 2-second gaps to avoid rate limits
  for (let i = 0; i < feeds.length; i++) {
    const items = await fetchRSSFeed(feeds[i], maxAgeHours);
    allItems.push(...items);

    // 2-second gap between feeds (skip after last feed)
    if (i < feeds.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Deduplicate by title similarity
  const seen = new Set<string>();
  const deduped = allItems.filter((item) => {
    const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    // Use first 50 chars as dedup key
    const key = normalizedTitle.slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by pubDate descending, keep top 30
  deduped.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  return deduped.slice(0, 30);
}
