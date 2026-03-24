import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";

vi.mock("@/lib/youtube", () => ({
  getChannelVideos: vi.fn(),
}));

import { getChannelVideos } from "@/lib/youtube";
const mockGetChannelVideos = vi.mocked(getChannelVideos);

describe("GET /api/videos/channel", () => {
  beforeEach(() => {
    mockGetChannelVideos.mockReset();
  });

  it("returns videos for a given channelId", async () => {
    mockGetChannelVideos.mockResolvedValueOnce({
      videos: [
        {
          id: "vid1",
          title: "Test",
          thumbnail: "https://example.com/thumb.jpg",
          channelName: "Channel",
          publishedAt: "2026-03-10T12:00:00Z",
          description: "Desc",
        },
      ],
      nextPageToken: undefined,
    });

    const request = new Request("http://localhost/api/videos/channel?channelId=UC123");
    const response = await GET(request);
    const data = await response.json();

    expect(mockGetChannelVideos).toHaveBeenCalledWith("UC123", 10);
    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe("vid1");
  });

  it("uses custom maxResults when provided", async () => {
    mockGetChannelVideos.mockResolvedValueOnce({ videos: [], nextPageToken: undefined });

    const request = new Request(
      "http://localhost/api/videos/channel?channelId=UC123&maxResults=5"
    );
    await GET(request);

    expect(mockGetChannelVideos).toHaveBeenCalledWith("UC123", 5);
  });

  it("returns 400 when channelId is missing", async () => {
    const request = new Request("http://localhost/api/videos/channel");
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("channelId parameter is required");
  });

  it("returns 500 when YouTube API key is not configured", async () => {
    mockGetChannelVideos.mockRejectedValueOnce(
      new Error("YouTube API key not configured")
    );

    const request = new Request("http://localhost/api/videos/channel?channelId=UC123");
    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("YouTube API key not configured");
  });

  it("returns 403 with friendly message when quota is exceeded", async () => {
    mockGetChannelVideos.mockRejectedValueOnce(new Error("quotaExceeded"));

    const request = new Request("http://localhost/api/videos/channel?channelId=UC123");
    const response = await GET(request);

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toBe("Daily limit reached, try again tomorrow");
  });
});
