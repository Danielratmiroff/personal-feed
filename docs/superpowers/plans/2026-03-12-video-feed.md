# Video Feed Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal YouTube video discovery app with category-based filtering and a full-page detail view.

**Architecture:** Single Next.js App Router project. API routes proxy YouTube Data API calls (keeping the key server-side). React frontend with Tailwind CSS renders a responsive tile grid with category tabs and a detail page with embedded player.

**Tech Stack:** Next.js (App Router, latest via create-next-app), React, TypeScript, Tailwind CSS, Vitest, React Testing Library

**Spec:** `docs/superpowers/specs/2026-03-12-video-feed-design.md`

---

## File Structure

```
src/
  app/
    layout.tsx                    — Root layout: html/body, Tailwind globals, app metadata
    page.tsx                      — Feed page: fetches videos, renders tabs + grid
    video/[id]/page.tsx           — Detail page: fetches single video, renders player + info
    api/videos/route.ts           — GET /api/videos?category=X&maxResults=N
    api/videos/[id]/route.ts      — GET /api/videos/:id
  components/
    CategoryTabs.tsx              — Tab bar: "All" | category buttons, calls onSelect
    VideoGrid.tsx                 — Responsive CSS grid wrapper for VideoCard list
    VideoCard.tsx                 — Single tile: thumbnail, title, channel, date
    VideoDetail.tsx               — Full detail: iframe player + metadata sidebar
    SkeletonGrid.tsx              — Loading placeholder grid
    ErrorMessage.tsx              — Inline error display with optional retry
  config/
    interests.ts                  — Export: interests string array
  lib/
    youtube.ts                    — searchVideos(query, maxResults), getVideoById(id)
  types/
    video.ts                      — Video interface
vitest.config.ts                  — Vitest config with jsdom + path aliases
```

---

## Chunk 1: Project Setup & Foundation

### Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Create Next.js app with Tailwind**

```bash
cd /home/ubuntu/code/ralph-test
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-git
```

The `--no-git` flag prevents reinitializing git (repo already exists). The directory contains existing files (`.claude/`, `docs/`, `.git/`) — `create-next-app` may prompt to proceed; accept it.

- [ ] **Step 2: Verify it runs**

```bash
cd /home/ubuntu/code/ralph-test
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with Tailwind"
```

---

### Task 2: Set Up Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add devDependencies and test script)

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: Create vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: [],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Add test script to package.json**

Add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify vitest runs**

```bash
npm test
```

Expected: Vitest runs and reports no test files found. It may exit with a non-zero code when there are no tests — this is expected. The important thing is that vitest itself runs without configuration errors.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add Vitest with jsdom and React Testing Library"
```

---

### Task 3: Types and Config

**Files:**
- Create: `src/types/video.ts`, `src/config/interests.ts`

- [ ] **Step 1: Create Video type**

Create `src/types/video.ts`:

```typescript
export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  publishedAt: string;
  description: string;
}
```

- [ ] **Step 2: Create interests config**

Create `src/config/interests.ts`:

```typescript
export const interests = ["AI", "AI Engineering"];
```

- [ ] **Step 3: Commit**

```bash
git add src/types/video.ts src/config/interests.ts
git commit -m "feat: add Video type and interests config"
```

---

### Task 4: YouTube API Client

**Files:**
- Create: `src/lib/youtube.ts`, `src/lib/__tests__/youtube.test.ts`

- [ ] **Step 1: Write failing test for searchVideos**

Create `src/lib/__tests__/youtube.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchVideos, getVideoById } from "../youtube";

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

    expect(videos).toEqual([
      {
        id: "abc123",
        title: "Test Video",
        thumbnail: "https://img.youtube.com/vi/abc123/mqdefault.jpg",
        channelName: "Test Channel",
        publishedAt: "2026-03-10T12:00:00Z",
        description: "A test video description",
      },
    ]);
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/__tests__/youtube.test.ts
```

Expected: FAIL — cannot resolve module (either `../youtube` or an import within it).

- [ ] **Step 3: Implement YouTube client**

Create `src/lib/youtube.ts`:

```typescript
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
  maxResults: number = 10
): Promise<Video[]> {
  const key = getApiKey();
  const params = new URLSearchParams({
    q: query,
    type: "video",
    part: "snippet",
    order: "relevance",
    maxResults: String(maxResults),
    key,
  });

  const res = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error?.message || "YouTube API error");
  }

  const data = await res.json();
  return (data.items || []).map(mapSearchItem);
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/lib/__tests__/youtube.test.ts
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/youtube.ts src/lib/__tests__/youtube.test.ts
git commit -m "feat: add YouTube API client with search and getById"
```

---

## Chunk 2: API Routes

### Task 5: Search Videos API Route

**Files:**
- Create: `src/app/api/videos/route.ts`, `src/app/api/videos/__tests__/route.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/app/api/videos/__tests__/route.test.ts`:

```typescript
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
    mockSearchVideos.mockResolvedValueOnce([
      {
        id: "abc123",
        title: "Test",
        thumbnail: "https://example.com/thumb.jpg",
        channelName: "Channel",
        publishedAt: "2026-03-10T12:00:00Z",
        description: "Desc",
      },
    ]);

    const request = new Request("http://localhost/api/videos?category=AI");
    const response = await GET(request);
    const data = await response.json();

    expect(mockSearchVideos).toHaveBeenCalledWith("AI", 10);
    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe("abc123");
  });

  it("uses custom maxResults when provided", async () => {
    mockSearchVideos.mockResolvedValueOnce([]);

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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/app/api/videos/__tests__/route.test.ts
```

Expected: FAIL — module `../route` not found.

- [ ] **Step 3: Implement search API route**

Create `src/app/api/videos/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { searchVideos } from "@/lib/youtube";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const maxResults = parseInt(searchParams.get("maxResults") || "10", 10);

  if (!category) {
    return NextResponse.json(
      { error: "category parameter is required" },
      { status: 400 }
    );
  }

  try {
    const videos = await searchVideos(category, maxResults);
    return NextResponse.json(videos);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("not configured")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }
    if (message.toLowerCase().includes("quota")) {
      return NextResponse.json(
        { error: "Daily limit reached, try again tomorrow" },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/app/api/videos/__tests__/route.test.ts
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/videos/route.ts src/app/api/videos/__tests__/route.test.ts
git commit -m "feat: add GET /api/videos search endpoint"
```

---

### Task 6: Video Detail API Route

**Files:**
- Create: `src/app/api/videos/[id]/route.ts`, `src/app/api/videos/[id]/__tests__/route.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/app/api/videos/[id]/__tests__/route.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/app/api/videos/\\[id\\]/__tests__/route.test.ts
```

Expected: FAIL — module `../route` not found.

- [ ] **Step 3: Implement detail API route**

Create `src/app/api/videos/[id]/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getVideoById } from "@/lib/youtube";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const video = await getVideoById(id);
    return NextResponse.json(video);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message.includes("not configured")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/app/api/videos/\\[id\\]/__tests__/route.test.ts
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add "src/app/api/videos/[id]/route.ts" "src/app/api/videos/[id]/__tests__/route.test.ts"
git commit -m "feat: add GET /api/videos/[id] detail endpoint"
```

---

## Chunk 3: UI Components

### Task 7: ErrorMessage and SkeletonGrid Components

**Files:**
- Create: `src/components/ErrorMessage.tsx`, `src/components/SkeletonGrid.tsx`

These are simple presentational components. No tests needed — they're trivial markup.

- [ ] **Step 1: Create ErrorMessage**

Create `src/components/ErrorMessage.tsx`:

```tsx
"use client";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <p className="text-lg mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create SkeletonGrid**

Create `src/components/SkeletonGrid.tsx`:

```tsx
export default function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 aspect-video rounded-lg mb-3" />
          <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
          <div className="bg-gray-200 h-3 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ErrorMessage.tsx src/components/SkeletonGrid.tsx
git commit -m "feat: add ErrorMessage and SkeletonGrid components"
```

---

### Task 8: VideoCard Component

**Files:**
- Create: `src/components/VideoCard.tsx`, `src/components/__tests__/VideoCard.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/components/__tests__/VideoCard.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import VideoCard from "../VideoCard";

const mockVideo = {
  id: "abc123",
  title: "Understanding AI in 2026",
  thumbnail: "https://img.youtube.com/vi/abc123/mqdefault.jpg",
  channelName: "Tech Channel",
  publishedAt: "2026-03-10T12:00:00Z",
  description: "A video about AI",
};

describe("VideoCard", () => {
  it("renders video title, channel name, and thumbnail", () => {
    render(<VideoCard video={mockVideo} />);

    expect(screen.getByText("Understanding AI in 2026")).toBeDefined();
    expect(screen.getByText("Tech Channel")).toBeDefined();
    expect(screen.getByRole("img")).toBeDefined();
  });

  it("links to the detail page", () => {
    render(<VideoCard video={mockVideo} />);

    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/video/abc123");
  });

  it("includes tab param in link when activeTab is set", () => {
    render(<VideoCard video={mockVideo} activeTab="AI" />);

    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/video/abc123?tab=AI");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/__tests__/VideoCard.test.tsx
```

Expected: FAIL — module `../VideoCard` not found.

- [ ] **Step 3: Implement VideoCard**

Create `src/components/VideoCard.tsx`:

```tsx
import Link from "next/link";
import { Video } from "@/types/video";

function timeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];
  for (const { label, seconds: s } of intervals) {
    const count = Math.floor(seconds / s);
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

export default function VideoCard({
  video,
  activeTab,
}: {
  video: Video;
  activeTab?: string;
}) {
  const tabParam = activeTab && activeTab !== "All" ? `?tab=${encodeURIComponent(activeTab)}` : "";
  return (
    <Link
      href={`/video/${video.id}${tabParam}`}
      className="group block rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
          {video.title}
        </h3>
        <p className="text-gray-500 text-xs mt-1">{video.channelName}</p>
        <p className="text-gray-400 text-xs mt-0.5">
          {timeAgo(video.publishedAt)}
        </p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/components/__tests__/VideoCard.test.tsx
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/VideoCard.tsx src/components/__tests__/VideoCard.test.tsx
git commit -m "feat: add VideoCard component with timeAgo display"
```

---

### Task 9: VideoGrid Component

**Files:**
- Create: `src/components/VideoGrid.tsx`, `src/components/__tests__/VideoGrid.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/components/__tests__/VideoGrid.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import VideoGrid from "../VideoGrid";

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

describe("VideoGrid", () => {
  it("renders a card for each video", () => {
    render(<VideoGrid videos={mockVideos} />);

    expect(screen.getByText("Video One")).toBeDefined();
    expect(screen.getByText("Video Two")).toBeDefined();
  });

  it("renders empty message when no videos", () => {
    render(<VideoGrid videos={[]} category="AI" />);

    expect(screen.getByText('No videos found for "AI"')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/__tests__/VideoGrid.test.tsx
```

Expected: FAIL — module `../VideoGrid` not found.

- [ ] **Step 3: Implement VideoGrid**

Create `src/components/VideoGrid.tsx`:

```tsx
import { Video } from "@/types/video";
import VideoCard from "./VideoCard";

interface VideoGridProps {
  videos: Video[];
  category?: string;
}

export default function VideoGrid({ videos, category }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <p>No videos found for &quot;{category || "this category"}&quot;</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} activeTab={category} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/components/__tests__/VideoGrid.test.tsx
```

Expected: All 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/VideoGrid.tsx src/components/__tests__/VideoGrid.test.tsx
git commit -m "feat: add VideoGrid component with empty state"
```

---

### Task 10: CategoryTabs Component

**Files:**
- Create: `src/components/CategoryTabs.tsx`

No tests — this is a thin presentational wrapper that prepends "All" to the categories list and applies conditional CSS classes. The logic is trivially verifiable by inspection and will be covered by the smoke test.

- [ ] **Step 1: Create CategoryTabs**

Create `src/components/CategoryTabs.tsx`:

```tsx
"use client";

interface CategoryTabsProps {
  categories: string[];
  activeTab: string;
  onSelect: (tab: string) => void;
}

export default function CategoryTabs({
  categories,
  activeTab,
  onSelect,
}: CategoryTabsProps) {
  const tabs = ["All", ...categories];

  return (
    <div className="flex gap-2 mb-8">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === tab
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CategoryTabs.tsx
git commit -m "feat: add CategoryTabs component"
```

---

### Task 11: VideoDetail Component

**Files:**
- Create: `src/components/VideoDetail.tsx`

No tests — this is a presentational component that renders an iframe and text fields. The `formatDate` helper is a single-line `toLocaleDateString` call. Verified by the smoke test.

- [ ] **Step 1: Create VideoDetail**

Create `src/components/VideoDetail.tsx`:

```tsx
import { Video } from "@/types/video";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function VideoDetail({ video }: { video: Video }) {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}`}
            title={video.title}
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
      <div className="lg:w-96">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {video.title}
        </h1>
        <p className="text-gray-600 font-medium">{video.channelName}</p>
        <p className="text-gray-400 text-sm mt-1">
          {formatDate(video.publishedAt)}
        </p>
        <div className="mt-6 border-t pt-4">
          <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
            {video.description}
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/VideoDetail.tsx
git commit -m "feat: add VideoDetail component with embedded player"
```

---

## Chunk 4: Pages & Integration

### Task 12: Feed Page

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update root layout**

Replace the contents of `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Feed",
  description: "Personal video discovery feed",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Implement feed page**

Replace the contents of `src/app/page.tsx`:

```tsx
"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Video } from "@/types/video";
import { interests } from "@/config/interests";
import CategoryTabs from "@/components/CategoryTabs";
import VideoGrid from "@/components/VideoGrid";
import SkeletonGrid from "@/components/SkeletonGrid";
import ErrorMessage from "@/components/ErrorMessage";

// Suspense boundary required because useSearchParams() triggers client-side bailout in Next.js App Router
export default function FeedPage() {
  return (
    <Suspense fallback={<main className="max-w-7xl mx-auto px-4 py-8"><SkeletonGrid /></main>}>
      <FeedContent />
    </Suspense>
  );
}

function FeedContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "All";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async (tab: string) => {
    setLoading(true);
    setError(null);

    try {
      if (tab === "All") {
        const results = await Promise.all(
          interests.map((cat) =>
            fetch(`/api/videos?category=${encodeURIComponent(cat)}`).then(
              (res) => {
                if (!res.ok) throw res;
                return res.json();
              }
            )
          )
        );
        const merged = results
          .flat()
          .sort(
            (a: Video, b: Video) =>
              new Date(b.publishedAt).getTime() -
              new Date(a.publishedAt).getTime()
          );
        // Deduplicate by video ID
        const seen = new Set<string>();
        const deduped = merged.filter((v: Video) => {
          if (seen.has(v.id)) return false;
          seen.add(v.id);
          return true;
        });
        setVideos(deduped);
      } else {
        const res = await fetch(
          `/api/videos?category=${encodeURIComponent(tab)}`
        );
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch videos");
        }
        setVideos(await res.json());
      }
    } catch (err) {
      if (err instanceof Response) {
        const data = await err.json();
        setError(data.error || "Failed to fetch videos");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch videos");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos(activeTab);
  }, [activeTab, fetchVideos]);

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab);
    // Update URL query param so detail page can link back with tab preserved
    const url = new URL(window.location.href);
    if (tab === "All") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", tab);
    }
    window.history.replaceState({}, "", url.toString());
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Video Feed</h1>
      <CategoryTabs
        categories={interests}
        activeTab={activeTab}
        onSelect={handleTabSelect}
      />
      {loading && <SkeletonGrid />}
      {error && (
        <ErrorMessage message={error} onRetry={() => fetchVideos(activeTab)} />
      )}
      {!loading && !error && (
        <VideoGrid videos={videos} category={activeTab} />
      )}
    </main>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/app/layout.tsx
git commit -m "feat: implement feed page with category tabs and video grid"
```

---

### Task 13: Video Detail Page

**Files:**
- Create: `src/app/video/[id]/page.tsx`

- [ ] **Step 1: Implement detail page**

Create `src/app/video/[id]/page.tsx`:

```tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Video } from "@/types/video";
import VideoDetail from "@/components/VideoDetail";
import ErrorMessage from "@/components/ErrorMessage";

// Suspense boundary required because useSearchParams() triggers client-side bailout in Next.js App Router
export default function VideoDetailPage() {
  return (
    <Suspense fallback={
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
          <div className="bg-gray-200 h-6 rounded w-1/2 mb-2" />
          <div className="bg-gray-200 h-4 rounded w-1/4" />
        </div>
      </main>
    }>
      <VideoDetailContent />
    </Suspense>
  );
}

function VideoDetailContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const backHref = tab ? `/?tab=${encodeURIComponent(tab)}` : "/";
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideo() {
      try {
        const res = await fetch(`/api/videos/${id}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load video");
        }
        setVideo(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load video");
      } finally {
        setLoading(false);
      }
    }
    fetchVideo();
  }, [id]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <Link
        href={backHref}
        className="text-gray-500 hover:text-gray-900 text-sm mb-6 inline-block transition-colors"
      >
        &larr; Back to feed
      </Link>

      {loading && (
        <div className="animate-pulse">
          <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
          <div className="bg-gray-200 h-6 rounded w-1/2 mb-2" />
          <div className="bg-gray-200 h-4 rounded w-1/4" />
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {!loading && !error && video && <VideoDetail video={video} />}
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add "src/app/video/[id]/page.tsx"
git commit -m "feat: implement video detail page with embedded player"
```

---

### Task 14: Final Verification

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: All tests pass (youtube.test.ts, route.test.ts x2, VideoCard.test.tsx, VideoGrid.test.tsx).

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Manual smoke test**

```bash
YOUTUBE_API_KEY=$YOUTUBE_API_KEY npm run dev
```

Ensure `YOUTUBE_API_KEY` is exported in your shell before running. Open http://localhost:3000 in a browser. Verify:
1. Page loads with "All" tab active and video tiles from both categories
2. Clicking "AI" tab filters to AI videos only
3. Clicking a video tile navigates to the detail page with embedded player
4. "Back to feed" link returns to the grid **with the previously selected tab still active**
5. Responsive layout works at different viewport widths

- [ ] **Step 4: Final commit (if needed)**

Only commit if the smoke test revealed changes that need fixing. Stage specific files:

```bash
git status
# Stage only the files you changed, e.g.:
# git add src/app/page.tsx src/components/VideoCard.tsx
# git commit -m "fix: address issues found during smoke test"
```

Skip this step if no changes were needed.
