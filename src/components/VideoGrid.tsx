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
