import { Video } from "@/types/video";
import { VideoItem } from "@/types/feed";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error("YouTube API key not configured");
  }
  return key;
}

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    thumbnails: { medium: { url: string } };
    channelTitle: string;
    publishedAt: string;
    description: string;
  };
}

interface YouTubeVideoItem {
  id: string;
  snippet: {
    title: string;
    thumbnails: { medium: { url: string } };
    channelTitle: string;
    publishedAt: string;
    description: string;
  };
}

function mapSearchItem(item: YouTubeSearchItem): Video {
  return {
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
    channelName: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    description: item.snippet.description,
  };
}

function mapVideoItem(item: YouTubeVideoItem): Video {
  return {
    id: item.id,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
    channelName: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    description: item.snippet.description,
  };
}

export async function searchVideos(
  query: string,
  maxResults: number = 10,
  pageToken?: string
): Promise<{ videos: Video[]; nextPageToken?: string }> {
  const key = getApiKey();
  const params = new URLSearchParams({
    q: query,
    type: "video",
    part: "snippet",
    order: "relevance",
    maxResults: String(maxResults),
    key,
  });

  if (pageToken) {
    params.set("pageToken", pageToken);
  }

  const res = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error?.message || "YouTube API error");
  }

  const data = await res.json();
  return {
    videos: (data.items || []).map(mapSearchItem),
    nextPageToken: data.nextPageToken,
  };
}

async function resolveChannelHandle(handle: string): Promise<string> {
  const key = getApiKey();
  const params = new URLSearchParams({
    part: "id",
    forHandle: handle,
    key,
  });

  const res = await fetch(`${YOUTUBE_API_BASE}/channels?${params}`);
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error?.message || "YouTube API error");
  }

  const data = await res.json();
  if (!data.items || data.items.length === 0) {
    throw new Error(`YouTube channel not found for handle: ${handle}`);
  }

  return data.items[0].id as string;
}

export async function getChannelVideos(
  channelId: string,
  maxResults: number = 10
): Promise<{ videos: Video[]; nextPageToken?: string }> {
  const key = getApiKey();

  if (channelId.startsWith("@")) {
    channelId = await resolveChannelHandle(channelId);
  }

  const params = new URLSearchParams({
    channelId,
    type: "video",
    part: "snippet",
    order: "date",
    maxResults: String(maxResults),
    key,
  });

  const res = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error?.message || "YouTube API error");
  }

  const data = await res.json();
  return {
    videos: (data.items || []).map(mapSearchItem),
    nextPageToken: data.nextPageToken,
  };
}

export function videoToFeedItem(video: Video): VideoItem {
  return {
    type: "video",
    id: video.id,
    title: video.title,
    thumbnail: video.thumbnail,
    sourceName: video.channelName,
    publishedAt: video.publishedAt,
    description: video.description,
  };
}

export async function getVideoById(id: string): Promise<Video> {
  const key = getApiKey();
  const params = new URLSearchParams({
    id,
    part: "snippet",
    key,
  });

  const res = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`);
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error?.message || "YouTube API error");
  }

  const data = await res.json();
  if (!data.items || data.items.length === 0) {
    throw new Error("Video not found");
  }

  return mapVideoItem(data.items[0]);
}
