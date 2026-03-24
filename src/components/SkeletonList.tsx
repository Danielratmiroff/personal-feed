export default function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-gray-200">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col sm:flex-row gap-6 py-8 animate-pulse"
        >
          {/* Thumbnail skeleton */}
          <div className="sm:w-56 md:w-64 lg:w-72 shrink-0">
            <div className="aspect-video bg-gray-200 rounded-sm" />
          </div>
          {/* Text skeleton */}
          <div className="flex flex-col justify-center gap-3 flex-1">
            <div className="bg-gray-200 h-7 rounded w-full max-w-lg" />
            <div className="bg-gray-200 h-7 rounded w-3/4 max-w-md" />
            <div className="bg-gray-200 h-4 rounded w-32 mt-2" />
            <div className="bg-gray-200 h-4 rounded w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}
