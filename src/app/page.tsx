"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import TabBar from "@/components/TabBar";
import LeadStory from "@/components/LeadStory";
import NewsCard from "@/components/NewsCard";
import { CATEGORIES } from "@/lib/categories";
import { NewsArticle } from "@/lib/cache";

interface CategoryData {
  articles: NewsArticle[];
  cached: boolean;
  cacheTimestamp: number;
}

function formatCacheTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Chicago",
    hour12: true,
  }) + " CT";
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("top-stories");
  const [data, setData] = useState<Record<string, CategoryData>>({});
  const [loadingTabs, setLoadingTabs] = useState<Set<string>>(new Set());
  const [errorTabs, setErrorTabs] = useState<Set<string>>(new Set());
  const [timedOutTabs, setTimedOutTabs] = useState<Set<string>>(new Set());
  const fetchedRef = useRef(false);

  const fetchCategory = useCallback(async (categoryId: string) => {
    setLoadingTabs((prev) => new Set(prev).add(categoryId));

    // 15-second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`/api/news?category=${categoryId}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const result = await res.json();
      setData((prev) => ({
        ...prev,
        [categoryId]: result,
      }));
    } catch (error) {
      clearTimeout(timeout);
      if ((error as Error).name === "AbortError") {
        setTimedOutTabs((prev) => new Set(prev).add(categoryId));
      } else {
        setErrorTabs((prev) => new Set(prev).add(categoryId));
      }
    } finally {
      setLoadingTabs((prev) => {
        const next = new Set(prev);
        next.delete(categoryId);
        return next;
      });
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    async function fetchAll() {
      // Priority: fetch Top Stories and Minnesota first
      const priority = ["top-stories", "minnesota"];
      await Promise.all(priority.map((id) => fetchCategory(id)));

      // Remaining categories in batches of 2 with 2-second gaps
      const remaining = CATEGORIES.filter(
        (c) => !priority.includes(c.id)
      ).map((c) => c.id);

      for (let i = 0; i < remaining.length; i += 2) {
        const batch = remaining.slice(i, i + 2);
        await Promise.all(batch.map((id) => fetchCategory(id)));
        if (i + 2 < remaining.length) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }

    fetchAll();
  }, [fetchCategory]);

  const loadedTabs = new Set(Object.keys(data));
  const currentData = data[activeTab];
  const currentCategory = CATEGORIES.find((c) => c.id === activeTab);

  return (
    <main>
      <header className="header">
        <h1>The Morning Brief</h1>
        <p className="subtitle">Minnesota Edition &mdash; Daily AI News Dashboard</p>
      </header>

      {currentData?.cacheTimestamp && (
        <div className="cache-banner">
          Last updated at {formatCacheTime(currentData.cacheTimestamp)}
        </div>
      )}

      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        loadingTabs={loadingTabs}
        loadedTabs={loadedTabs}
      />

      <section className="content">
        {loadingTabs.has(activeTab) && !currentData ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p className="loading-text">
              Fetching {currentCategory?.label || "news"}...
            </p>
          </div>
        ) : timedOutTabs.has(activeTab) && !currentData ? (
          <div className="timeout-message">
            This is taking longer than usual. Please refresh the page.
          </div>
        ) : errorTabs.has(activeTab) && !currentData ? (
          <div className="empty-state">
            <h3>Something went wrong</h3>
            <p>
              Could not load {currentCategory?.label}. Please try refreshing.
            </p>
          </div>
        ) : currentData?.articles?.length ? (
          <>
            <LeadStory
              article={currentData.articles[0]}
              categoryId={activeTab}
            />
            <div className="card-grid">
              {currentData.articles.slice(1).map((article, i) => (
                <NewsCard
                  key={`${activeTab}-${i}`}
                  article={article}
                  categoryId={activeTab}
                />
              ))}
            </div>
          </>
        ) : currentData ? (
          <div className="empty-state">
            <h3>No stories yet</h3>
            <p>
              No {currentCategory?.label} stories are available right now.
              Check back soon!
            </p>
          </div>
        ) : (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p className="loading-text">Waiting to start...</p>
          </div>
        )}
      </section>
    </main>
  );
}
