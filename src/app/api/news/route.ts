import { NextRequest, NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/categories";
import { fetchAllFeeds } from "@/lib/rss";
import {
  selectAndSummarize,
  fetchPeopleAndPurpose,
  fetchCollegeAthletics,
} from "@/lib/claude";
import {
  getCachedArticles,
  setCachedArticles,
  getCacheTimestamp,
  NewsArticle,
} from "@/lib/cache";

export const maxDuration = 60; // Vercel function timeout

export async function GET(request: NextRequest) {
  const categoryId = request.nextUrl.searchParams.get("category");

  if (!categoryId) {
    // Return cache status for all categories
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

  // Fetch fresh content
  let articles: NewsArticle[];

  try {
    if (category.fetchType === "web-search" && categoryId === "people-purpose") {
      articles = await fetchPeopleAndPurpose();
    } else if (
      category.fetchType === "web-fetch" &&
      categoryId === "college-athletics"
    ) {
      articles = await fetchCollegeAthletics();
    } else {
      // RSS-based categories
      const feedItems = await fetchAllFeeds(
        category.feeds,
        category.maxAgeHours
      );
      articles = await selectAndSummarize(
        category.label,
        feedItems,
        category.targetCount,
        category.promptRules
      );
    }

    // Cache the results
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
