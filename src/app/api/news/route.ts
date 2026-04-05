import { NextRequest, NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/categories";
import { fetchAllFeeds, stripHtml } from "@/lib/rss";
import {
  selectAndSummarize,
  fetchPeopleAndPurpose,
} from "@/lib/claude";
import {
  getCachedArticles,
  setCachedArticles,
  getCacheTimestamp,
} from "@/lib/cache";
import type { NewsArticle } from "@/lib/types";

export const maxDuration = 45;

export async function GET(request: NextRequest) {
  const categoryId = request.nextUrl.searchParams.get("category");

  if (!categoryId) {
    const status = CATEGORIES.map((cat) => ({
      id: cat.id,
      label: cat.label,
      cached: getCacheTimestamp(cat.id) !== null,
      cacheTimestamp: getCacheTimestamp(cat.id),
    }));
    return NextResponse.json({ categories: status });
  }

  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (!category) {
    return NextResponse.json({ error: "Unknown category" }, { status: 400 });
  }

  // Check cache first
  const cached = getCachedArticles(categoryId);
  if (cached) {
    return NextResponse.json({
      articles: cached,
      cached: true,
      cacheTimestamp: getCacheTimestamp(categoryId),
    });
  }

  let articles: NewsArticle[];

  try {
    // Fetch RSS feeds in parallel for all RSS-based categories
    const feedItems = category.feeds.length > 0
      ? await fetchAllFeeds(category.feeds, category.maxAgeHours)
      : [];

    if (categoryId === "people-purpose") {
      // People & Purpose: RSS feeds + specialized Claude prompt
      try {
        articles = await fetchPeopleAndPurpose(feedItems);
      } catch {
        articles = feedItems.slice(0, category.targetCount).map((item) => ({
          title: item.title,
          summary: item.description || "No summary available.",
          source: item.source,
          url: item.link,
          timeAgo: item.timeAgo,
          pubDate: item.pubDate,
        }));
      }
    } else {
      try {
        articles = await selectAndSummarize(
          categoryId,
          category.label,
          feedItems,
          category.targetCount,
          category.promptRules
        );
      } catch (error) {
        // Fallback: return raw RSS items without AI summaries
        console.error(`Claude failed for ${categoryId}, using RSS fallback:`, error);
        articles = feedItems.slice(0, category.targetCount).map((item) => ({
          title: item.title,
          summary: item.description || "No summary available.",
          source: item.source,
          url: item.link,
          timeAgo: item.timeAgo,
          pubDate: item.pubDate,
        }));
      }
    }

    // Sanitize all article text before caching/returning
    articles = articles.map((a) => ({
      ...a,
      title: stripHtml(a.title),
      summary: stripHtml(a.summary),
    }));

    if (articles.length > 0) {
      setCachedArticles(categoryId, articles);
    }

    return NextResponse.json({
      articles,
      cached: false,
      cacheTimestamp: Date.now(),
    });
  } catch (error) {
    console.error(`Error fetching ${categoryId}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch news", articles: [] },
      { status: 500 }
    );
  }
}
