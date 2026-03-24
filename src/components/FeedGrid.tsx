import { FeedItem } from "@/types/feed";
import FeedCard from "./FeedCard";

interface FeedGridProps {
  items: FeedItem[];
  category?: string;
}

export default function FeedGrid({ items, category }: FeedGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <p>No items found for &quot;{category || "this category"}&quot;</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {items.map((item) => (
        <FeedCard key={item.id} item={item} activeTab={category} />
      ))}
    </div>
  );
}
