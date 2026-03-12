import { Video } from "@/types/video";

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
