import Parser from "rss-parser";
import { ArticleItem } from "@/types/feed";

const parser = new Parser({
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; PersonalFeed/1.0; +https://github.com/danielratmiroff/personal-feed)",
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
  },
});

export async function fetchRSSArticles(
  feedUrl: string,
  sourceName: string,
  maxResults: number = 15
): Promise<ArticleItem[]> {
  const feed = await parser.parseURL(feedUrl);

  const items = (feed.items || []).slice(0, maxResults);

  return items
    .filter((item) => item.title && item.link)
    .map((item, index) => ({
      type: "article" as const,
      id: item.guid || item.link || `${sourceName}-${index}`,
      title: item.title || "",
      sourceName,
      publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
      description: item.contentSnippet
        ? item.contentSnippet.slice(0, 300)
        : item.content
          ? item.content.replace(/<[^>]*>/g, "").slice(0, 300)
          : "",
      url: item.link || "",
      thumbnail: item.enclosure?.url,
    }));
}
