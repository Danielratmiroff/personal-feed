export const interests = ["AI Engineering", "Technology", "Science", "AI"];

export interface ChannelConfig {
  name: string;
  channelId: string;
}

export const channels: ChannelConfig[] = [
  { name: "3Blue1Brown", channelId: "UCYO_jab_esuFRV4b17AJtAw" },
  { name: "Fireship", channelId: "UCsBjURrPoezykLs9EqgamOA" },
  { name: "Two Minute Papers", channelId: "UCbfYPyITQ-7l4upoX8nvctg" },
  { name: "Yannic Kilcher", channelId: "UCZHmQk67mSJgfCCTn7xBfew" },
];

export interface BlogSourceConfig {
  name: string;
  slug: string;
  type: "rss" | "hackernews";
  feedUrl?: string;
}

export const blogSources: BlogSourceConfig[] = [
  { name: "Hacker News", slug: "hackernews", type: "hackernews" },
  {
    name: "Anthropic",
    slug: "anthropic",
    type: "rss",
    feedUrl: "https://www.anthropic.com/rss",
  },
  {
    name: "DeepSeek",
    slug: "deepseek",
    type: "rss",
    feedUrl: "https://api-docs.deepseek.com/news/rss",
  },
  {
    name: "Google AI",
    slug: "google-ai",
    type: "rss",
    feedUrl: "https://blog.google/technology/ai/rss/",
  },
];
