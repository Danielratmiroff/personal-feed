"use client";

interface ChannelConfig {
  name: string;
  channelId: string;
}

interface CategoryTabsProps {
  categories: string[];
  channels?: ChannelConfig[];
  activeTab: string;
  onSelect: (tab: string) => void;
}

export default function CategoryTabs({
  categories,
  channels = [],
  activeTab,
  onSelect,
}: CategoryTabsProps) {
  const tabs = ["All", ...categories];

  return (
    <div className="flex flex-wrap gap-2 mb-8 items-center">
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
      {channels.length > 0 && (
        <>
          <span className="text-gray-300 mx-1">|</span>
          {channels.map((channel) => {
            const tabValue = `channel:${channel.channelId}`;
            return (
              <button
                key={tabValue}
                onClick={() => onSelect(tabValue)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tabValue
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {channel.name}
              </button>
            );
          })}
        </>
      )}
    </div>
  );
}
