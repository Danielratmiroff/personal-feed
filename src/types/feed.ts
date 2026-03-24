export interface FeedItemBase {
  id: string;
  title: string;
  sourceName: string;
  publishedAt: string;
  description: string;
}

export interface VideoItem extends FeedItemBase {
  type: "video";
  thumbnail: string;
}

export interface ArticleItem extends FeedItemBase {
  type: "article";
  url: string;
  thumbnail?: string;
}

export type FeedItem = VideoItem | ArticleItem;
