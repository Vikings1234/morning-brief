"use client";

import type { NewsArticle } from "@/lib/types";

interface NewsCardProps {
  article: NewsArticle;
  categoryId: string;
}

function getBadgeClass(categoryId: string): string {
  if (["mn-pro-sports", "mn-college-sports", "stillwater-ponies"].includes(categoryId)) {
    return "source-badge sports";
  }
  if (categoryId === "people-purpose") {
    return "source-badge community";
  }
  return "source-badge";
}

export default function NewsCard({ article, categoryId }: NewsCardProps) {
  return (
    <article className="news-card">
      <h3 className="card-title">
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          {article.title}
        </a>
      </h3>
      <p className="card-summary">{article.summary}</p>
      <div className="card-meta">
        <span className={getBadgeClass(categoryId)}>{article.source}</span>
        <span className="time-label">{article.timeAgo}</span>
      </div>
    </article>
  );
}
