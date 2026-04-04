"use client";

import type { NewsArticle } from "@/lib/types";

interface LeadStoryProps {
  article: NewsArticle;
  categoryId: string;
}

function getBadgeClass(categoryId: string): string {
  if (["mn-pro-sports", "mn-college-sports", "stillwater-ponies", "college-athletics"].includes(categoryId)) {
    return "source-badge sports";
  }
  if (categoryId === "people-purpose") {
    return "source-badge community";
  }
  return "source-badge";
}

export default function LeadStory({ article, categoryId }: LeadStoryProps) {
  return (
    <article className="lead-story">
      <h2 className="lead-title">
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          {article.title}
        </a>
      </h2>
      <p className="lead-summary">{article.summary}</p>
      <div className="lead-meta">
        <span className={getBadgeClass(categoryId)}>{article.source}</span>
        <span className="time-label">{article.timeAgo}</span>
      </div>
    </article>
  );
}
