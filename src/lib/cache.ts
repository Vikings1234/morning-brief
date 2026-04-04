import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

export interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  url: string;
  timeAgo: string;
  pubDate: string;
}

interface CacheEntry {
  articles: NewsArticle[];
  timestamp: number;
}

const CACHE_TTL_MS = 20 * 60 * 60 * 1000; // 20 hours
const CACHE_DIR = join(process.cwd(), ".cache");

function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function cacheFilePath(categoryId: string): string {
  return join(CACHE_DIR, `${categoryId}.json`);
}

export function getCachedArticles(categoryId: string): NewsArticle[] | null {
  try {
    ensureCacheDir();
    const filePath = cacheFilePath(categoryId);
    if (!existsSync(filePath)) return null;

    const raw = readFileSync(filePath, "utf-8");
    const entry: CacheEntry = JSON.parse(raw);

    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      return null; // Cache expired
    }

    return entry.articles;
  } catch {
    return null;
  }
}

export function setCachedArticles(
  categoryId: string,
  articles: NewsArticle[]
): void {
  try {
    ensureCacheDir();
    const entry: CacheEntry = {
      articles,
      timestamp: Date.now(),
    };
    writeFileSync(cacheFilePath(categoryId), JSON.stringify(entry, null, 2));
  } catch (error) {
    console.error(`Cache write error for ${categoryId}:`, error);
  }
}

export function getCacheTimestamp(categoryId: string): number | null {
  try {
    ensureCacheDir();
    const filePath = cacheFilePath(categoryId);
    if (!existsSync(filePath)) return null;

    const raw = readFileSync(filePath, "utf-8");
    const entry: CacheEntry = JSON.parse(raw);

    if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;

    return entry.timestamp;
  } catch {
    return null;
  }
}
