"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { FeedItem, VideoItem } from "@/types/feed";
import { Video } from "@/types/video";
import { interests, channels, blogSources } from "@/config/interests";
import CategoryTabs, { ParentTab } from "@/components/CategoryTabs";
import FeedGrid from "@/components/FeedGrid";
import SkeletonGrid from "@/components/SkeletonGrid";
import ErrorMessage from "@/components/ErrorMessage";
import ThemeToggle from "@/components/ThemeToggle";

function videoToFeedItem(video: Video): VideoItem {
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

const validParentTabs: ParentTab[] = ["All", "Videos", "Articles"];

function parseParentTab(value: string | null): ParentTab {
  if (value && validParentTabs.includes(value as ParentTab)) {
    return value as ParentTab;
  }
  return "All";
}

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
  const initialParent = parseParentTab(searchParams.get("parent"));
  const initialChild = searchParams.get("tab") || "All";

  const [activeParentTab, setActiveParentTab] = useState<ParentTab>(initialParent);
  const [activeChildTab, setActiveChildTab] = useState(initialChild);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllVideos = useCallback(async (): Promise<FeedItem[]> => {
    const categoryFetches = interests.map((cat) =>
      fetch(`/api/videos/filtered?category=${encodeURIComponent(cat)}`, { cache: 'no-store' })
        .then((res) => {
          if (!res.ok) throw res;
          return res.json();
        })
        .then((videos: Video[]) => videos.map(videoToFeedItem))
        .catch(() => [] as FeedItem[])
    );
    const channelFetches = channels.map((ch) =>
      fetch(`/api/videos/channel?channelId=${encodeURIComponent(ch.channelId)}`, { cache: 'no-store' })
        .then((res) => {
          if (!res.ok) throw res;
          return res.json();
        })
        .then((videos: Video[]) => videos.map(videoToFeedItem))
        .catch(() => [] as FeedItem[])
    );
    const results = await Promise.all([...categoryFetches, ...channelFetches]);
    return results.flat();
  }, []);

  const fetchAllArticles = useCallback(async (): Promise<FeedItem[]> => {
    const blogFetches = blogSources.map((source) =>
      fetch(`/api/articles?source=${encodeURIComponent(source.slug)}`, { cache: 'no-store' })
        .then((res) => {
          if (!res.ok) throw res;
          return res.json();
        })
        .catch(() => [] as FeedItem[])
    );
    const results = await Promise.all(blogFetches);
    return results.flat();
  }, []);

  const dedupeAndSort = (items: FeedItem[]): FeedItem[] => {
    const sorted = items.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    const seen = new Set<string>();
    return sorted.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  const fetchFeed = useCallback(async (parentTab: ParentTab, childTab: string) => {
    setLoading(true);
    setError(null);

    try {
      if (parentTab === "All") {
        // Fetch everything: videos + articles
        const [videos, articles] = await Promise.all([fetchAllVideos(), fetchAllArticles()]);
        setItems(dedupeAndSort([...videos, ...articles]));
      } else if (parentTab === "Videos") {
        if (childTab === "All") {
          // All videos
          const videos = await fetchAllVideos();
          setItems(dedupeAndSort(videos));
        } else if (childTab.startsWith("channel:")) {
          const channelId = childTab.slice("channel:".length);
          const res = await fetch(
            `/api/videos/channel?channelId=${encodeURIComponent(channelId)}`,
            { cache: 'no-store' }
          );
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to fetch videos");
          }
          const videos: Video[] = await res.json();
          setItems(videos.map(videoToFeedItem));
        } else {
          // Interest/category filter
          const res = await fetch(
            `/api/videos/filtered?category=${encodeURIComponent(childTab)}`,
            { cache: 'no-store' }
          );
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to fetch videos");
          }
          const videos: Video[] = await res.json();
          setItems(videos.map(videoToFeedItem));
        }
      } else if (parentTab === "Articles") {
        if (childTab === "All") {
          // All articles
          const articles = await fetchAllArticles();
          setItems(dedupeAndSort(articles));
        } else if (childTab.startsWith("blog:")) {
          const slug = childTab.slice("blog:".length);
          const res = await fetch(
            `/api/articles?source=${encodeURIComponent(slug)}&maxResults=30`,
            { cache: 'no-store' }
          );
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to fetch articles");
          }
          const articles: FeedItem[] = await res.json();
          setItems(
            articles.sort(
              (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
            )
          );
        }
      }
    } catch (err) {
      if (err instanceof Response) {
        const data = await err.json();
        setError(data.error || "Failed to fetch feed");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch feed");
      }
    } finally {
      setLoading(false);
    }
  }, [fetchAllVideos, fetchAllArticles]);

  useEffect(() => {
    fetchFeed(activeParentTab, activeChildTab);
  }, [activeParentTab, activeChildTab, fetchFeed]);

  const updateUrl = (parent: ParentTab, child: string) => {
    const url = new URL(window.location.href);
    if (parent === "All") {
      url.searchParams.delete("parent");
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("parent", parent);
      if (child === "All") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", child);
      }
    }
    window.history.replaceState({}, "", url.toString());
  };

  const handleParentSelect = (tab: ParentTab) => {
    setActiveParentTab(tab);
    setActiveChildTab("All");
    updateUrl(tab, "All");
  };

  const handleChildSelect = (tab: string) => {
    setActiveChildTab(tab);
    updateUrl(activeParentTab, tab);
  };

  const displayLabel = activeParentTab === "All"
    ? "All"
    : activeChildTab === "All"
      ? activeParentTab
      : activeChildTab;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Feed</h1>
        <ThemeToggle />
      </div>
      <CategoryTabs
        categories={interests}
        channels={channels}
        blogSources={blogSources}
        activeParentTab={activeParentTab}
        activeChildTab={activeChildTab}
        onParentSelect={handleParentSelect}
        onChildSelect={handleChildSelect}
      />
      {loading && <SkeletonGrid />}
      {error && (
        <ErrorMessage message={error} onRetry={() => fetchFeed(activeParentTab, activeChildTab)} />
      )}
      {!loading && !error && (
        <FeedGrid items={items} category={displayLabel} />
      )}
    </main>
  );
}
