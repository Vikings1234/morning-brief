"use client";

import { NewsArticle } from "@/lib/cache";

interface NewsCardProps {
  article: NewsArticle;
  categoryId: string;
}

function getBadgeClass(categoryId: string): string {
  if (categoryId === "mn-sports" || categoryId === "college-athletics") {
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
