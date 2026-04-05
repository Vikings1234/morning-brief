"use client";

import type { NewsArticle } from "@/lib/types";

interface LeadStoryProps {
  article: NewsArticle;
  categoryId: string;
}

const SPORTS_TABS = ["mn-pro-sports", "mn-college-sports", "stillwater-ponies"];

function getSourceBadgeClass(categoryId: string): string {
  if (SPORTS_TABS.includes(categoryId)) return "source-badge sports";
  if (categoryId === "people-purpose") return "source-badge community";
  return "source-badge";
}

export default function LeadStory({ article, categoryId }: LeadStoryProps) {
  const hasUrl = Boolean(article.url);

  return (
    <article className="lead-story">
      <div className="lead-layout">
        <div className="lead-body">
          <div className="lead-label">Lead Story</div>
          <h2 className="lead-title">
            {hasUrl ? (
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                {article.title}
              </a>
            ) : (
              article.title
            )}
          </h2>
          <p className="lead-summary">{article.summary}</p>
        </div>
        <div className="lead-sidebar">
          <div className="lead-meta">
            <span className={getSourceBadgeClass(categoryId)}>
              {article.source}
            </span>
            <span className="time-label">{article.timeAgo}</span>
            {article.scope && (
              <span className={`pill-badge ${SPORTS_TABS.includes(categoryId) ? "pill-red" : categoryId === "people-purpose" ? "pill-green" : ""}`}>
                {article.scope}
              </span>
            )}
            {article.impact && (
              <span className="pill-badge pill-green">{article.impact}</span>
            )}
          </div>
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
      </div>
    </article>
  );
}
