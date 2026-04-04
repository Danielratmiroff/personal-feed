import Link from "next/link";
import { FeedItem } from "@/types/feed";
import { timeAgo } from "@/lib/utils";


function ExternalLinkIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 inline-block ml-1 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

export default function FeedCard({
  item,
  activeTab,
}: {
  item: FeedItem;
  activeTab?: string;
}) {
  const tabParam =
    activeTab && activeTab !== "All"
      ? `?tab=${encodeURIComponent(activeTab)}`
      : "";

  if (item.type === "video") {
    return (
      <Link
        href={`/video/${item.id}${tabParam}`}
        className="group flex gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="w-40 flex-shrink-0">
          <div className="aspect-video relative overflow-hidden rounded-md">
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm leading-snug">
            {item.title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1.5">
            {item.sourceName}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
            {timeAgo(item.publishedAt)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      <p className="text-gray-400 dark:text-gray-500 text-xs mb-1">
        {item.sourceName} · {timeAgo(item.publishedAt)}
      </p>
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-3 text-base leading-snug">
        {item.title}
        <ExternalLinkIcon />
      </h3>
      {item.description && (
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1.5 line-clamp-3 leading-relaxed">
          {item.description}
        </p>
      )}
    </a>
  );
}
