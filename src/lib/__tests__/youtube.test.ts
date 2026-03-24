import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchVideos, getVideoById, getChannelVideos } from "../youtube";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.stubEnv("YOUTUBE_API_KEY", "test-api-key");
  mockFetch.mockReset();
});

describe("searchVideos", () => {
  it("calls YouTube search API and maps response to Video[]", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          {
            id: { videoId: "abc123" },
            snippet: {
              title: "Test Video",
              thumbnails: { medium: { url: "https://img.youtube.com/vi/abc123/mqdefault.jpg" } },
              channelTitle: "Test Channel",
              publishedAt: "2026-03-10T12:00:00Z",
              description: "A test video description",
            },
          },
        ],
      }),
    });

    const videos = await searchVideos("AI", 10);

    expect(mockFetch).toHaveBeenCalledOnce();
    const url = new URL(mockFetch.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe(
      "https://www.googleapis.com/youtube/v3/search"
    );
    expect(url.searchParams.get("q")).toBe("AI");
    expect(url.searchParams.get("type")).toBe("video");
    expect(url.searchParams.get("part")).toBe("snippet");
    expect(url.searchParams.get("order")).toBe("relevance");
    expect(url.searchParams.get("maxResults")).toBe("10");
    expect(url.searchParams.get("key")).toBe("test-api-key");

    expect(videos).toEqual({
      videos: [
        {
          id: "abc123",
          title: "Test Video",
          thumbnail: "https://img.youtube.com/vi/abc123/mqdefault.jpg",
          channelName: "Test Channel",
          publishedAt: "2026-03-10T12:00:00Z",
          description: "A test video description",
        },
      ],
      nextPageToken: undefined,
    });
  });

  it("throws when API key is missing", async () => {
    vi.stubEnv("YOUTUBE_API_KEY", "");

    await expect(searchVideos("AI")).rejects.toThrow(
      "YouTube API key not configured"
    );
  });

  it("throws with message when YouTube API returns error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        error: { message: "quotaExceeded" },
      }),
    });

    await expect(searchVideos("AI")).rejects.toThrow("quotaExceeded");
  });
});

describe("getVideoById", () => {
  it("calls YouTube videos API and maps response to Video", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          {
            id: "abc123",
            snippet: {
              title: "Test Video",
              thumbnails: { medium: { url: "https://img.youtube.com/vi/abc123/mqdefault.jpg" } },
              channelTitle: "Test Channel",
              publishedAt: "2026-03-10T12:00:00Z",
              description: "Full description of the test video",
            },
          },
        ],
      }),
    });

    const video = await getVideoById("abc123");

    const url = new URL(mockFetch.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe(
      "https://www.googleapis.com/youtube/v3/videos"
    );
    expect(url.searchParams.get("id")).toBe("abc123");
    expect(url.searchParams.get("part")).toBe("snippet");
    expect(url.searchParams.get("key")).toBe("test-api-key");

    expect(video).toEqual({
      id: "abc123",
      title: "Test Video",
      thumbnail: "https://img.youtube.com/vi/abc123/mqdefault.jpg",
      channelName: "Test Channel",
      publishedAt: "2026-03-10T12:00:00Z",
      description: "Full description of the test video",
    });
  });

  it("throws when video not found", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [] }),
    });

    await expect(getVideoById("nonexistent")).rejects.toThrow("Video not found");
  });
});

describe("getChannelVideos", () => {
  it("calls YouTube search API with channelId and order=date", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          {
            id: { videoId: "vid1" },
            snippet: {
              title: "Channel Video",
              thumbnails: { medium: { url: "https://img.youtube.com/vi/vid1/mqdefault.jpg" } },
              channelTitle: "My Channel",
              publishedAt: "2026-03-15T10:00:00Z",
              description: "A channel video",
            },
          },
        ],
        nextPageToken: "TOKEN123",
      }),
    });

    const result = await getChannelVideos("UC_CHANNEL_ID", 5);

    expect(mockFetch).toHaveBeenCalledOnce();
    const url = new URL(mockFetch.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe(
      "https://www.googleapis.com/youtube/v3/search"
    );
    expect(url.searchParams.get("channelId")).toBe("UC_CHANNEL_ID");
    expect(url.searchParams.get("type")).toBe("video");
    expect(url.searchParams.get("order")).toBe("date");
    expect(url.searchParams.get("maxResults")).toBe("5");
    expect(url.searchParams.get("key")).toBe("test-api-key");

    expect(result).toEqual({
      videos: [
        {
          id: "vid1",
          title: "Channel Video",
          thumbnail: "https://img.youtube.com/vi/vid1/mqdefault.jpg",
          channelName: "My Channel",
          publishedAt: "2026-03-15T10:00:00Z",
          description: "A channel video",
        },
      ],
      nextPageToken: "TOKEN123",
    });
  });

  it("throws when API key is missing", async () => {
    vi.stubEnv("YOUTUBE_API_KEY", "");

    await expect(getChannelVideos("UC_CHANNEL_ID")).rejects.toThrow(
      "YouTube API key not configured"
    );
  });

  it("throws with message when YouTube API returns error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        error: { message: "quotaExceeded" },
      }),
    });

    await expect(getChannelVideos("UC_CHANNEL_ID")).rejects.toThrow("quotaExceeded");
  });
});
