"use client";

import type { NewsArticle } from "@/lib/types";

interface NewsCardProps {
  article: NewsArticle;
  categoryId: string;
}

const SPORTS_TABS = ["mn-pro-sports", "mn-college-sports", "stillwater-ponies"];

function getSourceBadgeClass(categoryId: string): string {
  if (SPORTS_TABS.includes(categoryId)) return "source-badge sports";
  if (categoryId === "people-purpose") return "source-badge community";
  return "source-badge";
}

function getScopeBadgeClass(categoryId: string): string {
  if (SPORTS_TABS.includes(categoryId)) return "pill-badge pill-red";
  if (categoryId === "people-purpose") return "pill-badge pill-green";
  return "pill-badge";
}

export default function NewsCard({ article, categoryId }: NewsCardProps) {
  const hasUrl = Boolean(article.url);

  return (
    <article className="news-card">
      <div className="card-badges">
        <span className={getSourceBadgeClass(categoryId)}>{article.source}</span>
        <span className="time-label">{article.timeAgo}</span>
        {article.scope && (
          <span className={getScopeBadgeClass(categoryId)}>{article.scope}</span>
        )}
        {article.impact && (
          <span className="pill-badge pill-green">{article.impact}</span>
        )}
      </div>
      <h3 className="card-title">
        {hasUrl ? (
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        ) : (
          article.title
        )}
      </h3>
      <p className="card-summary">{article.summary}</p>
      <div className="card-footer">
        {hasUrl ? (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="read-more"
          >
            Read the full story &rarr;
          </a>
        ) : (
          <span className="paywall-note">Requires a paid subscription</span>
        )}
      </div>
    </article>
  );
}
