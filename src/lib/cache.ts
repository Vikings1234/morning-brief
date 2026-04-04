import { NewsArticle } from "./types";

interface CacheEntry {
  articles: NewsArticle[];
  timestamp: number;
}

const CACHE_TTL_MS = 20 * 60 * 60 * 1000; // 20 hours

// In-memory cache — persists across requests in warm Vercel function instances
const memoryCache = new Map<string, CacheEntry>();

export function getCachedArticles(categoryId: string): NewsArticle[] | null {
  const entry = memoryCache.get(categoryId);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    memoryCache.delete(categoryId);
    return null;
  }
  return entry.articles;
}

export function setCachedArticles(
  categoryId: string,
  articles: NewsArticle[]
): void {
  memoryCache.set(categoryId, {
    articles,
    timestamp: Date.now(),
  });
}

export function getCacheTimestamp(categoryId: string): number | null {
  const entry = memoryCache.get(categoryId);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    memoryCache.delete(categoryId);
    return null;
  }
  return entry.timestamp;
}
