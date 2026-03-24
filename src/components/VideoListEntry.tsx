import Link from "next/link";
import { Video } from "@/types/video";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function VideoListEntry({
  video,
  activeTab,
}: {
  video: Video;
  activeTab?: string;
}) {
  const tabParam =
    activeTab && activeTab !== "All"
      ? `?tab=${encodeURIComponent(activeTab)}`
      : "";

  return (
    <Link href={`/video/${video.id}${tabParam}`} className="group block">
      <div className="flex flex-col sm:flex-row gap-6 py-8">
        {/* Thumbnail */}
        <div className="sm:w-56 md:w-64 lg:w-72 shrink-0">
          <div className="aspect-video overflow-hidden rounded-sm">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
        </div>

        {/* Title and metadata */}
        <div className="flex flex-col justify-center min-w-0">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold leading-snug tracking-tight text-gray-900 group-hover:text-gray-600 transition-colors">
            {video.title}
          </h2>
          <p className="text-sm text-gray-400 mt-3">{video.channelName}</p>
          <p className="text-sm text-gray-400 mt-1">
            {formatDate(video.publishedAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
