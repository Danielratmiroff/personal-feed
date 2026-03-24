import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import VideoList from "../VideoList";

const mockVideos = [
  {
    id: "abc",
    title: "Video One",
    thumbnail: "https://example.com/1.jpg",
    channelName: "Channel A",
    publishedAt: "2026-03-10T12:00:00Z",
    description: "Desc 1",
  },
  {
    id: "def",
    title: "Video Two",
    thumbnail: "https://example.com/2.jpg",
    channelName: "Channel B",
    publishedAt: "2026-03-09T12:00:00Z",
    description: "Desc 2",
  },
];

describe("VideoList", () => {
  it("renders an entry for each video", () => {
    render(<VideoList videos={mockVideos} />);

    expect(screen.getByText("Video One")).toBeDefined();
    expect(screen.getByText("Video Two")).toBeDefined();
  });

  it("renders empty message when no videos", () => {
    render(<VideoList videos={[]} category="AI" />);

    expect(screen.getByText('No videos found for "AI"')).toBeDefined();
  });
});
