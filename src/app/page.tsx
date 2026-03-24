"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { FeedItem, VideoItem } from "@/types/feed";
import { Video } from "@/types/video";
import { interests, channels, blogSources } from "@/config/interests";
import CategoryTabs from "@/components/CategoryTabs";
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
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async (tab: string) => {
    setLoading(true);
    setError(null);

    try {
      if (tab === "All") {
        const categoryFetches = interests.map((cat) =>
          fetch(`/api/videos/filtered?category=${encodeURIComponent(cat)}`, { cache: 'no-store' })
            .then((res) => {
              if (!res.ok) throw res;
              return res.json();
            })
            .then((videos: Video[]) => videos.map(videoToFeedItem))
        );
        const channelFetches = channels.map((ch) =>
          fetch(`/api/videos/channel?channelId=${encodeURIComponent(ch.channelId)}`, { cache: 'no-store' })
            .then((res) => {
              if (!res.ok) throw res;
              return res.json();
            })
            .then((videos: Video[]) => videos.map(videoToFeedItem))
        );
        const blogFetches = blogSources.map((source) =>
          fetch(`/api/articles?source=${encodeURIComponent(source.slug)}`, { cache: 'no-store' })
            .then((res) => {
              if (!res.ok) throw res;
              return res.json();
            })
            .catch(() => [] as FeedItem[])
        );

        const results = await Promise.all([...categoryFetches, ...channelFetches, ...blogFetches]);
        const merged = results
          .flat()
          .sort(
            (a: FeedItem, b: FeedItem) =>
              new Date(b.publishedAt).getTime() -
              new Date(a.publishedAt).getTime()
          );
        // Deduplicate by ID
        const seen = new Set<string>();
        const deduped = merged.filter((item: FeedItem) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        setItems(deduped);
      } else if (tab.startsWith("blog:")) {
        const slug = tab.slice("blog:".length);
        const res = await fetch(
          `/api/articles?source=${encodeURIComponent(slug)}&maxResults=30`,
          { cache: 'no-store' }
        );
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch articles");
        }
        setItems(await res.json());
      } else if (tab.startsWith("channel:")) {
        const channelId = tab.slice("channel:".length);
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
        const res = await fetch(
          `/api/videos/filtered?category=${encodeURIComponent(tab)}`,
          { cache: 'no-store' }
        );
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch videos");
        }
        const videos: Video[] = await res.json();
        setItems(videos.map(videoToFeedItem));
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
  }, []);

  useEffect(() => {
    fetchFeed(activeTab);
  }, [activeTab, fetchFeed]);

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Feed</h1>
        <ThemeToggle />
      </div>
      <CategoryTabs
        categories={interests}
        channels={channels}
        blogSources={blogSources}
        activeTab={activeTab}
        onSelect={handleTabSelect}
      />
      {loading && <SkeletonGrid />}
      {error && (
        <ErrorMessage message={error} onRetry={() => fetchFeed(activeTab)} />
      )}
      {!loading && !error && (
        <FeedGrid items={items} category={activeTab} />
      )}
    </main>
  );
}
