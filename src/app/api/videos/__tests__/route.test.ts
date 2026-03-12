import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";

vi.mock("@/lib/youtube", () => ({
  searchVideos: vi.fn(),
}));

import { searchVideos } from "@/lib/youtube";
const mockSearchVideos = vi.mocked(searchVideos);

describe("GET /api/videos", () => {
  beforeEach(() => {
    mockSearchVideos.mockReset();
  });

  it("returns videos for a given category", async () => {
    mockSearchVideos.mockResolvedValueOnce({
      videos: [
        {
          id: "abc123",
          title: "Test",
          thumbnail: "https://example.com/thumb.jpg",
          channelName: "Channel",
          publishedAt: "2026-03-10T12:00:00Z",
          description: "Desc",
        },
      ],
      nextPageToken: undefined,
    });

    const request = new Request("http://localhost/api/videos?category=AI");
    const response = await GET(request);
    const data = await response.json();

    expect(mockSearchVideos).toHaveBeenCalledWith("AI", 10);
    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe("abc123");
  });

  it("uses custom maxResults when provided", async () => {
    mockSearchVideos.mockResolvedValueOnce({ videos: [], nextPageToken: undefined });

    const request = new Request(
      "http://localhost/api/videos?category=AI&maxResults=5"
    );
    await GET(request);

    expect(mockSearchVideos).toHaveBeenCalledWith("AI", 5);
  });

  it("returns 400 when category is missing", async () => {
    const request = new Request("http://localhost/api/videos");
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("category parameter is required");
  });

  it("returns 500 when YouTube API key is not configured", async () => {
    mockSearchVideos.mockRejectedValueOnce(
      new Error("YouTube API key not configured")
    );

    const request = new Request("http://localhost/api/videos?category=AI");
    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("YouTube API key not configured");
  });

  it("returns 403 with friendly message when quota is exceeded", async () => {
    mockSearchVideos.mockRejectedValueOnce(new Error("quotaExceeded"));

    const request = new Request("http://localhost/api/videos?category=AI");
    const response = await GET(request);

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toBe("Daily limit reached, try again tomorrow");
  });
});
