export interface CategoryConfig {
  id: string;
  label: string;
  fetchType: "rss" | "web-search" | "web-fetch";
  feeds: string[];
  maxAgeHours: number;
  targetCount: number;
  promptRules?: string;
}

const BANNED_SOURCES = [
  "Reuters",
  "Fox News",
  "Fox Business",
  "Wall Street Journal",
  "CNN",
  "Bloomberg",
  "MarketWatch",
  "Forbes",
  "Politico",
  "France 24",
  "UPI",
  "USA Today",
  "Wired",
];

export const BANNED_SOURCES_STRING = BANNED_SOURCES.join(", ");

export const CATEGORIES: CategoryConfig[] = [
  {
    id: "top-stories",
    label: "Top Stories",
    fetchType: "rss",
    feeds: [
      "https://feeds.npr.org/1001/rss.xml",
      "https://feeds.bbci.co.uk/news/rss.xml",
      "https://feeds.nbcnews.com/nbcnews/public/news",
      "https://thehill.com/homenews/feed/",
      "https://news.google.com/rss/headlines/section/topic/NATION?hl=en-US&gl=US&ceid=US:en",
    ],
    maxAgeHours: 48,
    targetCount: 12,
  },
  {
    id: "people-purpose",
    label: "\u2764 People & Purpose",
    fetchType: "web-search",
    feeds: [],
    maxAgeHours: 336, // 14 days
    targetCount: 6,
    promptRules:
      "Search for Minnesota community stories: food banks, housing help, teachers making a difference, nonprofits, rural MN stories, volunteer efforts. Focus on positive community impact.",
  },
  {
    id: "minnesota",
    label: "Minnesota",
    fetchType: "rss",
    feeds: [
      "https://www.mprnews.org/topic/all-news/rss",
      "https://www.minnpost.com/feed/",
      "https://minnesotareformer.com/feed/",
      "https://bringmethenews.com/.rss/full/",
      "https://news.google.com/rss/search?q=Minnesota+news&hl=en-US&gl=US&ceid=US:en",
    ],
    maxAgeHours: 96,
    targetCount: 12,
  },
  {
    id: "mn-sports",
    label: "MN Sports",
    fetchType: "rss",
    feeds: [
      "https://news.google.com/rss/search?q=Minnesota+Timberwolves+OR+Minnesota+Wild+OR+Minnesota+Twins&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=Minnesota+Vikings+OR+Minnesota+Lynx+OR+Minnesota+Gophers&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=Minnesota+high+school+hockey+OR+basketball+MSHSL&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=Stillwater+Ponies+high+school&hl=en-US&gl=US&ceid=US:en",
      "https://bringmethenews.com/.rss/full/",
    ],
    maxAgeHours: 96,
    targetCount: 12,
    promptRules: `MN Sports required mix:
- At least 2 pro team stories (Timberwolves, Wild, Twins, Vikings, or Lynx)
- At least 1 Gophers story if available
- At least 1 high school story (boys or girls hockey or basketball) if available
- PRIORITY: If ANY Stillwater Ponies (Stillwater Area High School) story exists in the feed, you MUST include it regardless of other content priorities. Stillwater Ponies content is the highest priority for this user.
- Sources to prioritize for Stillwater coverage: Stillwater Gazette, Bring Me The News, Pioneer Press prep sports, KARE11 prep sports
- Fill remaining slots with most newsworthy MN sports content`,
  },
  {
    id: "college-athletics",
    label: "College Athletics",
    fetchType: "web-fetch",
    feeds: [
      "https://gophersports.com",
      "https://msumavericks.com",
      "https://umdbulldogs.com",
      "https://tommiesports.com",
    ],
    maxAgeHours: 48,
    targetCount: 10,
    promptRules:
      "Focus on University of Minnesota Gophers, MSU Mankato Mavericks, UMD Bulldogs, and St. Thomas Tommies. Use College Hockey News as fallback for hockey scores.",
  },
  {
    id: "politics",
    label: "Politics",
    fetchType: "rss",
    feeds: [
      "https://feeds.npr.org/1014/rss.xml",
      "https://thehill.com/homenews/senate/feed/",
      "https://thehill.com/homenews/house/feed/",
      "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml",
      "https://news.google.com/rss/headlines/section/topic/POLITICS?hl=en-US&gl=US&ceid=US:en",
    ],
    maxAgeHours: 96,
    targetCount: 12,
  },
  {
    id: "business",
    label: "Business",
    fetchType: "rss",
    feeds: [
      "https://feeds.npr.org/1006/rss.xml",
      "https://feeds.bbci.co.uk/news/business/rss.xml",
      "https://feeds.nbcnews.com/nbcnews/public/business",
      "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en",
    ],
    maxAgeHours: 96,
    targetCount: 12,
  },
  {
    id: "tech-ai",
    label: "Tech & AI",
    fetchType: "rss",
    feeds: [
      "https://techcrunch.com/feed/",
      "https://feeds.arstechnica.com/arstechnica/index/",
      "https://venturebeat.com/feed/",
      "https://www.engadget.com/rss.xml",
      "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en",
    ],
    maxAgeHours: 96,
    targetCount: 12,
  },
  {
    id: "world",
    label: "World",
    fetchType: "rss",
    feeds: [
      "https://feeds.bbci.co.uk/news/world/rss.xml",
      "https://www.aljazeera.com/xml/rss/all.xml",
      "https://feeds.npr.org/1004/rss.xml",
      "https://rss.dw.com/rdf/rss-en-all",
      "https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en",
    ],
    maxAgeHours: 96,
    targetCount: 12,
  },
];
