import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";

vi.mock("@/lib/youtube", () => ({
  getVideoById: vi.fn(),
}));

import { getVideoById } from "@/lib/youtube";
const mockGetVideoById = vi.mocked(getVideoById);

describe("GET /api/videos/[id]", () => {
  beforeEach(() => {
    mockGetVideoById.mockReset();
  });

  it("returns a single video by ID", async () => {
    const video = {
      id: "abc123",
      title: "Test",
      thumbnail: "https://example.com/thumb.jpg",
      channelName: "Channel",
      publishedAt: "2026-03-10T12:00:00Z",
      description: "Full description",
    };
    mockGetVideoById.mockResolvedValueOnce(video);

    const request = new Request("http://localhost/api/videos/abc123");
    const response = await GET(request, { params: Promise.resolve({ id: "abc123" }) });
    const data = await response.json();

    expect(mockGetVideoById).toHaveBeenCalledWith("abc123");
    expect(response.status).toBe(200);
    expect(data.id).toBe("abc123");
    expect(data.description).toBe("Full description");
  });

  it("returns 404 when video not found", async () => {
    mockGetVideoById.mockRejectedValueOnce(new Error("Video not found"));

    const request = new Request("http://localhost/api/videos/nonexistent");
    const response = await GET(request, {
      params: Promise.resolve({ id: "nonexistent" }),
    });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe("Video not found");
  });

  it("returns 500 when YouTube API key is not configured", async () => {
    mockGetVideoById.mockRejectedValueOnce(
      new Error("YouTube API key not configured")
    );

    const request = new Request("http://localhost/api/videos/abc123");
    const response = await GET(request, {
      params: Promise.resolve({ id: "abc123" }),
    });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("YouTube API key not configured");
  });
});
