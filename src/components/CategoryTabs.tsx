"use client";

interface CategoryTabsProps {
  categories: string[];
  activeTab: string;
  onSelect: (tab: string) => void;
}

export default function CategoryTabs({
  categories,
  activeTab,
  onSelect,
}: CategoryTabsProps) {
  const tabs = ["All", ...categories];

  return (
    <div className="flex gap-2 mb-8">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === tab
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
