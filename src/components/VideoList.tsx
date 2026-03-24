import { Video } from "@/types/video";
import VideoListEntry from "./VideoListEntry";

interface VideoListProps {
  videos: Video[];
  category?: string;
}

export default function VideoList({ videos, category }: VideoListProps) {
  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <p>No videos found for &quot;{category || "this category"}&quot;</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {videos.map((video) => (
        <VideoListEntry key={video.id} video={video} activeTab={category} />
      ))}
    </div>
  );
}
