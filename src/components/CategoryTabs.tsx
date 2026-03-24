"use client";

interface ChannelConfig {
  name: string;
  channelId: string;
}

interface BlogSourceConfig {
  name: string;
  slug: string;
}

interface CategoryTabsProps {
  categories: string[];
  channels?: ChannelConfig[];
  blogSources?: BlogSourceConfig[];
  activeTab: string;
  onSelect: (tab: string) => void;
}

export default function CategoryTabs({
  categories,
  channels = [],
  blogSources = [],
  activeTab,
  onSelect,
}: CategoryTabsProps) {
  const tabs = ["All", ...categories];

  const buttonClass = (isActive: boolean) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
      isActive
        ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
    }`;

  return (
    <div className="flex flex-wrap gap-2 mb-8 items-center">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          className={buttonClass(activeTab === tab)}
        >
          {tab}
        </button>
      ))}
      {channels.length > 0 && (
        <>
          <span className="text-gray-300 dark:text-gray-600 mx-1">|</span>
          {channels.map((channel) => {
            const tabValue = `channel:${channel.channelId}`;
            return (
              <button
                key={tabValue}
                onClick={() => onSelect(tabValue)}
                className={buttonClass(activeTab === tabValue)}
              >
                {channel.name}
              </button>
            );
          })}
        </>
      )}
      {blogSources.length > 0 && (
        <>
          <span className="text-gray-300 dark:text-gray-600 mx-1">|</span>
          {blogSources.map((source) => {
            const tabValue = `blog:${source.slug}`;
            return (
              <button
                key={tabValue}
                onClick={() => onSelect(tabValue)}
                className={buttonClass(activeTab === tabValue)}
              >
                {source.name}
              </button>
            );
          })}
        </>
      )}
    </div>
  );
}
