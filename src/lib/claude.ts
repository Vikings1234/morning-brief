import Anthropic from "@anthropic-ai/sdk";
import { FeedItem } from "./rss";
import { NewsArticle } from "./cache";
import { BANNED_SOURCES_STRING } from "./categories";

const anthropic = new Anthropic();

export async function selectAndSummarize(
  categoryLabel: string,
  feedItems: FeedItem[],
  targetCount: number,
  promptRules?: string
): Promise<NewsArticle[]> {
  if (feedItems.length === 0) {
    return [];
  }

  const feedItemsText = feedItems
    .map(
      (item, i) =>
        `[${i + 1}] TITLE: ${item.title}\nSOURCE: ${item.source}\nURL: ${item.link}\nTIME_AGO: ${item.timeAgo}\nDESCRIPTION: ${item.description || "N/A"}`
    )
    .join("\n\n");

  const systemPrompt = `You are a news editor selecting the best articles for a daily news dashboard read by an 81-year-old man in Stillwater, Minnesota. He reads this every morning at 5 AM.

Your job: select the ${targetCount} most important and interesting articles from the feed items provided, and write a clean 2-sentence summary for each.

RULES:
- Maximum 1 article per source — prevents any single source flooding the tab
- Return a JSON array ONLY — no markdown, no backticks, no preamble, no explanation
- Use the TIME_AGO value provided — do not calculate or guess timestamps
- Never fabricate URLs — use the article URL provided, never an empty string
- Minimum 5 items — if fewer than 5 feed items exist, include all of them
- BANNED SOURCES (never include): ${BANNED_SOURCES_STRING}
${promptRules ? `\nCATEGORY-SPECIFIC RULES:\n${promptRules}` : ""}

Return format — a JSON array of objects with these exact fields:
[{"title": "...", "summary": "Two sentence summary.", "source": "Source Name", "url": "https://...", "timeAgo": "3h ago", "pubDate": "ISO date string"}]`;

  const userPrompt = `Category: ${categoryLabel}

Here are the feed items to select from:

${feedItemsText}

Select the best ${targetCount} articles and return the JSON array.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: userPrompt }],
      system: systemPrompt,
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON from response — handle possible markdown wrapping
    let jsonStr = text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const articles: NewsArticle[] = JSON.parse(jsonStr);
    return articles;
  } catch (error) {
    console.error(`Claude API error for ${categoryLabel}:`, error);
    // Fallback: return feed items as-is without summaries
    return feedItems.slice(0, targetCount).map((item) => ({
      title: item.title,
      summary: item.description || "No summary available.",
      source: item.source,
      url: item.link,
      timeAgo: item.timeAgo,
      pubDate: item.pubDate,
    }));
  }
}

export async function fetchPeopleAndPurpose(): Promise<NewsArticle[]> {
  const queries = [
    "Minnesota food bank volunteer community",
    "Minnesota housing help nonprofit",
    "Minnesota teacher making a difference",
    "Minnesota nonprofit community impact",
    "rural Minnesota community stories",
    "Minnesota volunteer charity local hero",
  ];

  const systemPrompt = `You are a news editor finding heartwarming Minnesota community stories for a daily news dashboard. The reader is an 81-year-old man in Stillwater, MN.

Based on your knowledge, create 6 compelling community impact stories from Minnesota. These should focus on:
- Food banks and community feeding programs
- Housing assistance and Habitat for Humanity
- Teachers and educators making a difference
- Local nonprofits and their impact
- Rural Minnesota community resilience
- Volunteer efforts and local heroes

RULES:
- Return a JSON array ONLY — no markdown, no backticks, no preamble
- Each story should have a realistic title, 2-sentence summary, source name, and a URL to the source's homepage
- BANNED SOURCES: ${BANNED_SOURCES_STRING}
- Focus on positive, uplifting community stories

Return format:
[{"title": "...", "summary": "Two sentences.", "source": "Source Name", "url": "https://...", "timeAgo": "recent", "pubDate": "${new Date().toISOString()}"}]`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Find 6 recent Minnesota community impact stories. Search topics: ${queries.join(", ")}. Return JSON array.`,
        },
      ],
      system: systemPrompt,
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    let jsonStr = text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Claude API error for People & Purpose:", error);
    return [];
  }
}

export async function fetchCollegeAthletics(): Promise<NewsArticle[]> {
  const systemPrompt = `You are a sports editor creating a college athletics roundup for a Minnesota reader. Focus on:
- University of Minnesota Gophers (all sports)
- Minnesota State Mankato Mavericks
- UMD Bulldogs
- St. Thomas Tommies
- College hockey (use College Hockey News as a source reference)

RULES:
- Return a JSON array ONLY — no markdown, no backticks, no preamble
- Up to 10 articles covering recent games, scores, and news
- Use real team/school homepage URLs when no specific article URL exists
- BANNED SOURCES: ${BANNED_SOURCES_STRING}

Return format:
[{"title": "...", "summary": "Two sentences.", "source": "Source Name", "url": "https://...", "timeAgo": "recent", "pubDate": "${new Date().toISOString()}"}]`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content:
            "Create a college athletics roundup for Minnesota teams. Include recent games, standings, and notable performances. Return JSON array.",
        },
      ],
      system: systemPrompt,
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    let jsonStr = text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Claude API error for College Athletics:", error);
    return [];
  }
}
