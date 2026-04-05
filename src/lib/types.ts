export interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  url: string;
  timeAgo: string;
  pubDate: string;
  scope?: string;
  impact?: string;
}
