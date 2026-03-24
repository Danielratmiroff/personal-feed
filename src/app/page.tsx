"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Video } from "@/types/video";
import { interests, channels } from "@/config/interests";
import CategoryTabs from "@/components/CategoryTabs";
import VideoGrid from "@/components/VideoGrid";
import SkeletonGrid from "@/components/SkeletonGrid";
import ErrorMessage from "@/components/ErrorMessage";
import ThemeToggle from "@/components/ThemeToggle";

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
        const categoryFetches = interests.map((cat) =>
          fetch(`/api/videos/filtered?category=${encodeURIComponent(cat)}`, { cache: 'no-store' }).then(
            (res) => {
              if (!res.ok) throw res;
              return res.json();
            }
          )
        );
        const channelFetches = channels.map((ch) =>
          fetch(`/api/videos/channel?channelId=${encodeURIComponent(ch.channelId)}`, { cache: 'no-store' }).then(
            (res) => {
              if (!res.ok) throw res;
              return res.json();
            }
          )
        );
        const results = await Promise.all([...categoryFetches, ...channelFetches]);
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
        setVideos(await res.json());
      } else {
        const res = await fetch(
          `/api/videos/filtered?category=${encodeURIComponent(tab)}`,
          { cache: 'no-store' }
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Video Feed</h1>
        <ThemeToggle />
      </div>
      <CategoryTabs
        categories={interests}
        channels={channels}
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
