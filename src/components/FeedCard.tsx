import Link from "next/link";
import { FeedItem } from "@/types/feed";
import { timeAgo } from "@/lib/utils";

const sourceGradients: Record<string, string> = {
  "Hacker News": "from-orange-400 to-orange-600",
  Anthropic: "from-purple-400 to-purple-600",
  DeepSeek: "from-blue-400 to-blue-600",
  "Google AI": "from-green-400 to-green-600",
};

function ArticleIcon() {
  return (
    <svg
      className="w-6 h-6 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
      />
    </svg>
  );
}

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

  const gradient =
    sourceGradients[item.sourceName] || "from-gray-400 to-gray-600";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      <div className="w-40 flex-shrink-0">
        {item.thumbnail ? (
          <div className="aspect-video relative overflow-hidden rounded-md">
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        ) : (
          <div
            className={`aspect-video rounded-md bg-gradient-to-br ${gradient} flex items-center justify-center`}
          >
            <ArticleIcon />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm leading-snug">
          {item.title}
          <ExternalLinkIcon />
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1.5">
          {item.sourceName}
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
          {timeAgo(item.publishedAt)}
        </p>
      </div>
    </a>
  );
}
