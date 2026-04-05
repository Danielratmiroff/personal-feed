export const interests = ["AI Engineering", "Technology", "Science", "AI"];

export interface ChannelConfig {
  name: string;
  channelId: string;
}

export const channels: ChannelConfig[] = [
  // Existing
  { name: "3Blue1Brown", channelId: "UCYO_jab_esuFRV4b17AJtAw" },
  { name: "Fireship", channelId: "UCsBjURrPoezykLs9EqgamOA" },
  { name: "Two Minute Papers", channelId: "UCbfYPyITQ-7l4upoX8nvctg" },
  { name: "Yannic Kilcher", channelId: "UCZHmQk67mSJgfCCTn7xBfew" },
  // AI/ML Podcasts & Interviews
  { name: "Dwarkesh Patel", channelId: "UCXl4i9dYBrFOabk0xGmbkRA" },
  { name: "Machine Learning Street Talk", channelId: "UCMLtBahI5DMrt0NPvDSoIRQ" },
  // AI Engineering & News
  { name: "AI Explained", channelId: "UCNJ1Ymd5yFuUPtn21xtRbbw" },
  { name: "Andrej Karpathy", channelId: "UCXUPKJO5MZQN11PqgIvyuvQ" },
  { name: "Matt Wolfe", channelId: "UChpleBmo18P08aKCIgti38g" },
  { name: "The AI Advantage", channelId: "UCHhYXsLBEVVnbvsq57n1MTQ" },
  // Education & Tutorials
  { name: "Sentdex", channelId: "UCfzlCWGWYyIQ0aLC5w48gBQ" },
  { name: "StatQuest", channelId: "UCtYLUTtgS3k1Fg4y5tAhLbw" },
  // Health & Longevity
  { name: "Bryan Johnson", channelId: "UCnRVL1-HJnXWB_Xi2dAoTcg" },
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
    name: "Anthropic Engineering",
    slug: "anthropic-engineering",
    type: "rss",
    feedUrl:
      "https://raw.githubusercontent.com/taobojlen/anthropic-rss-feed/main/anthropic_engineering_rss.xml",
  },
  {
    name: "Anthropic News",
    slug: "anthropic-news",
    type: "rss",
    feedUrl:
      "https://raw.githubusercontent.com/taobojlen/anthropic-rss-feed/main/anthropic_news_rss.xml",
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
  {
    name: "HuggingFace Papers",
    slug: "huggingface-papers",
    type: "rss",
    feedUrl:
      "https://raw.githubusercontent.com/exfly/huggingface-daily-papers/main/feed.xml",
  },
  {
    name: "Papers With Code",
    slug: "papers-with-code",
    type: "rss",
    feedUrl: "https://paperswithcode.com/latest/rss",
  },
];
