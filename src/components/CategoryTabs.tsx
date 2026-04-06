"use client";

interface ChannelConfig {
  name: string;
  channelId: string;
}

interface BlogSourceConfig {
  name: string;
  slug: string;
}

export type ParentTab = "All" | "Videos" | "Articles";

interface CategoryTabsProps {
  categories: string[];
  channels?: ChannelConfig[];
  blogSources?: BlogSourceConfig[];
  activeParentTab: ParentTab;
  activeChildTab: string;
  onParentSelect: (tab: ParentTab) => void;
  onChildSelect: (tab: string) => void;
}

const parentTabs: ParentTab[] = ["All", "Videos", "Articles"];

export default function CategoryTabs({
  categories,
  channels = [],
  blogSources = [],
  activeParentTab,
  activeChildTab,
  onParentSelect,
  onChildSelect,
}: CategoryTabsProps) {
  const parentTabClass = (isActive: boolean) =>
    `px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
      isActive
        ? "border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600"
    }`;

  const pillClass = (isActive: boolean) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
      isActive
        ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
    }`;

  return (
    <div className="mb-8">
      {/* Parent tabs row */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-4">
        {parentTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onParentSelect(tab)}
            className={parentTabClass(activeParentTab === tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Child pills row */}
      {activeParentTab === "Videos" && (
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => onChildSelect("All")}
            className={pillClass(activeChildTab === "All")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onChildSelect(cat)}
              className={pillClass(activeChildTab === cat)}
            >
              {cat}
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
                    onClick={() => onChildSelect(tabValue)}
                    className={pillClass(activeChildTab === tabValue)}
                  >
                    {channel.name}
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}

      {activeParentTab === "Articles" && (
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => onChildSelect("All")}
            className={pillClass(activeChildTab === "All")}
          >
            All
          </button>
          {blogSources.map((source) => {
            const tabValue = `blog:${source.slug}`;
            return (
              <button
                key={tabValue}
                onClick={() => onChildSelect(tabValue)}
                className={pillClass(activeChildTab === tabValue)}
              >
                {source.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
