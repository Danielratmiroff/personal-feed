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
