import { describe, it, expect, beforeAll } from "vitest";
import { blogSources } from "@/config/interests";

let networkAvailable = false;

beforeAll(async () => {
  try {
    await fetch("https://raw.githubusercontent.com", {
      method: "HEAD",
      signal: AbortSignal.timeout(3000),
    });
    networkAvailable = true;
  } catch {
    networkAvailable = false;
  }
}, 5000);

describe("RSS feed URLs", () => {
  const rssFeeds = blogSources.filter((s) => s.type === "rss" && s.feedUrl);

  it.each(rssFeeds.map((s) => [s.name, s.feedUrl!]))(
    "%s returns HTTP 200",
    async (name, feedUrl) => {
      if (!networkAvailable) {
        console.warn(`[feeds] Skipping (no network): ${name}`);
        return;
      }
      const res = await fetch(feedUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(8000),
      });
      expect(res.status).toBe(200);
    },
    12_000,
  );
});
