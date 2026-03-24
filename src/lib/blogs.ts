import { ArticleItem } from "@/types/feed";
import { BlogSourceConfig } from "@/config/interests";
import { fetchTopStories } from "./hackernews";
import { fetchRSSArticles } from "./rss";

export async function fetchBlogArticles(
  source: BlogSourceConfig,
  maxResults: number = 15
): Promise<ArticleItem[]> {
  if (source.type === "hackernews") {
    return fetchTopStories(maxResults);
  }
  if (!source.feedUrl) {
    throw new Error(`No feed URL configured for source: ${source.name}`);
  }
  return fetchRSSArticles(source.feedUrl, source.name, maxResults);
}
