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
      className="group block rounded-lg overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900 transition-shadow"
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm">
          {video.title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{video.channelName}</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
          {timeAgo(video.publishedAt)}
        </p>
      </div>
    </Link>
  );
}
