"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Video } from "@/types/video";
import VideoDetail from "@/components/VideoDetail";
import ErrorMessage from "@/components/ErrorMessage";
import ThemeToggle from "@/components/ThemeToggle";

// Suspense boundary required because useSearchParams() triggers client-side bailout in Next.js App Router
export default function VideoDetailPage() {
  return (
    <Suspense fallback={
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
          <div className="bg-gray-200 dark:bg-gray-700 h-6 rounded w-1/2 mb-2" />
          <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/4" />
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
      <div className="flex items-center justify-between mb-6">
        <Link
          href={backHref}
          className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 text-sm inline-block transition-colors"
        >
          &larr; Back to feed
        </Link>
        <ThemeToggle />
      </div>

      {loading && (
        <div className="animate-pulse">
          <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
          <div className="bg-gray-200 dark:bg-gray-700 h-6 rounded w-1/2 mb-2" />
          <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/4" />
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {!loading && !error && video && <VideoDetail video={video} />}
    </main>
  );
}
