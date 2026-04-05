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
    fetchType: "rss",
    feeds: [
      "https://www.mprnews.org/topic/all-news/rss",
      "https://www.minnpost.com/feed/",
      "https://sahanjournal.com/feed/",
      "https://feeds.npr.org/1001/rss.xml",
      "https://news.google.com/rss/search?q=Minnesota+nonprofit+OR+food+bank+OR+homeless+shelter+OR+community+service&hl=en-US&gl=US&ceid=US:en",
    ],
    maxAgeHours: 336, // 14 days
    targetCount: 6,
    promptRules:
      "Select stories about community impact: food banks, housing help, teachers, nonprofits, rural MN, volunteer efforts. Only include stories with a positive community angle. Assign scope and impact fields.",
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
    id: "mn-pro-sports",
    label: "MN Pro Sports",
    fetchType: "rss",
    feeds: [
      "https://news.google.com/rss/search?q=Minnesota+Timberwolves&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=Minnesota+Wild&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=Minnesota+Twins&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=Minnesota+Vikings&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=Minnesota+Lynx&hl=en-US&gl=US&ceid=US:en",
    ],
    maxAgeHours: 96,
    targetCount: 12,
    promptRules: `Include stories from all 5 Minnesota pro teams: Timberwolves, Wild, Twins, Vikings, and Lynx.
- Try to include at least 1 story per team if available
- Include actual scores, standings, and key player performances in summaries
- Set scope to "Pro" for all articles
- Fill remaining slots with the most newsworthy MN pro sports content
- Only include professional Minnesota team stories — no college or high school`,
  },
  {
    id: "mn-college-sports",
    label: "MN College Sports",
    fetchType: "rss",
    feeds: [
      "https://news.google.com/rss/search?q=Minnesota+Gophers+hockey+OR+basketball+OR+football&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=UMD+Bulldogs+OR+Mankato+Mavericks+OR+St+Thomas+Tommies&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=NCHC+hockey+Minnesota&hl=en-US&gl=US&ceid=US:en",
    ],
    maxAgeHours: 96,
    targetCount: 10,
    promptRules: `Focus on Minnesota college sports:
- Minnesota Gophers hockey, basketball, and football are top priority
- Also include UMD Bulldogs, MSU Mankato Mavericks, and St. Thomas Tommies
- NCHC hockey conference news involving Minnesota teams
- Include actual scores, standings, and key player performances in summaries
- Set scope to one of: "College Hockey" | "College Men" | "College Women"
- Only include college-level athletics — no pro or high school`,
  },
  {
    id: "stillwater-ponies",
    label: "Stillwater Ponies",
    fetchType: "rss",
    feeds: [
      "https://news.google.com/rss/search?q=%22Stillwater+Ponies%22&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=%22Stillwater+Area+High+School%22+sports&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=Stillwater+MN+high+school+sports&hl=en-US&gl=US&ceid=US:en",
    ],
    maxAgeHours: 336, // 14 days — widen window since HS coverage is sparse
    targetCount: 10,
    promptRules: `You are a Stillwater Area High School sports reporter. Only include stories about Stillwater Ponies athletics.
- Cover all sports: hockey (boys and girls), basketball, football, baseball, lacrosse, swimming
- Include actual scores and key player performances in summaries when available
- Set scope to one of: "High School Boys" | "High School Girls" | "Prep Sports"
- If fewer than 3 stories are available, widen the search window to 2 weeks
- Never include stories about other schools unless they are playing against Stillwater
- Priority sources: Stillwater Gazette, Bring Me The News, Pioneer Press prep sports, KARE11 prep sports
- This is the highest priority tab for the primary user`,
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
