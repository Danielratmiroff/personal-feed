export default function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 aspect-video rounded-lg mb-3" />
          <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
          <div className="bg-gray-200 h-3 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
