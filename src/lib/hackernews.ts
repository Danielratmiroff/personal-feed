import { ArticleItem } from "@/types/feed";

const HN_API_BASE = "https://hacker-news.firebaseio.com/v0";

interface HNStory {
  id: number;
  title: string;
  url?: string;
  by: string;
  time: number;
  score: number;
  text?: string;
}

export async function fetchTopStories(
  maxResults: number = 15
): Promise<ArticleItem[]> {
  const res = await fetch(`${HN_API_BASE}/topstories.json`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch Hacker News top stories");
  }

  const ids: number[] = await res.json();
  const topIds = ids.slice(0, maxResults);

  const stories = await Promise.all(
    topIds.map(async (id) => {
      const storyRes = await fetch(`${HN_API_BASE}/item/${id}.json`, {
        next: { revalidate: 60 },
      });
      if (!storyRes.ok) return null;
      return storyRes.json() as Promise<HNStory>;
    })
  );

  return stories
    .filter((story): story is HNStory => story !== null && story.title != null)
    .map((story) => ({
      type: "article" as const,
      id: `hn-${story.id}`,
      title: story.title,
      sourceName: "Hacker News",
      publishedAt: new Date(story.time * 1000).toISOString(),
      description: story.text
        ? story.text.replace(/<[^>]*>/g, "").slice(0, 300)
        : "",
      url:
        story.url || `https://news.ycombinator.com/item?id=${story.id}`,
    }));
}
