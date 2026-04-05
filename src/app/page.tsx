"use client";

import { useState, useEffect, useCallback } from "react";
import TabBar from "@/components/TabBar";
import LeadStory from "@/components/LeadStory";
import NewsCard from "@/components/NewsCard";
import { CATEGORIES } from "@/lib/categories";
import type { NewsArticle } from "@/lib/types";

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

  const fetchCategory = useCallback(async (categoryId: string) => {
    // Skip if already loaded or currently loading
    if (loadingTabs.has(categoryId)) return;

    setLoadingTabs((prev) => new Set(prev).add(categoryId));
    setErrorTabs((prev) => {
      const next = new Set(prev);
      next.delete(categoryId);
      return next;
    });
    setTimedOutTabs((prev) => {
      const next = new Set(prev);
      next.delete(categoryId);
      return next;
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

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
  }, [loadingTabs]);

  // Fetch active tab when it changes (or on initial load)
  useEffect(() => {
    if (!data[activeTab] && !loadingTabs.has(activeTab)) {
      fetchCategory(activeTab);
    }
  }, [activeTab, data, loadingTabs, fetchCategory]);

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
