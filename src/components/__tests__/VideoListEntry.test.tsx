import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import VideoListEntry from "../VideoListEntry";

const mockVideo = {
  id: "abc123",
  title: "Understanding AI in 2026",
  thumbnail: "https://img.youtube.com/vi/abc123/mqdefault.jpg",
  channelName: "Tech Channel",
  publishedAt: "2026-03-10T12:00:00Z",
  description: "A video about AI",
};

describe("VideoListEntry", () => {
  it("renders video title, channel name, and thumbnail", () => {
    render(<VideoListEntry video={mockVideo} />);

    expect(screen.getByText("Understanding AI in 2026")).toBeDefined();
    expect(screen.getByText("Tech Channel")).toBeDefined();
    expect(screen.getByRole("img")).toBeDefined();
  });

  it("links to the detail page", () => {
    render(<VideoListEntry video={mockVideo} />);

    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/video/abc123");
  });

  it("includes tab param in link when activeTab is set", () => {
    render(<VideoListEntry video={mockVideo} activeTab="AI" />);

    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/video/abc123?tab=AI");
  });
});
