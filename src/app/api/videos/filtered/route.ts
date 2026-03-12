import { NextResponse } from "next/server";
import { searchVideos } from "@/lib/youtube";
import { filterVideosWithAgent } from "@/lib/agent";
import { userProfile } from "@/config/interests";
import { Video } from "@/types/video";

const DEFAULT_COUNT = 8;
const MAX_COUNT = 25;
const MAX_ITERATIONS = 3;
const VIDEOS_PER_PAGE = 25;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const targetCount = Math.min(
    Math.max(1, Number(searchParams.get("count")) || DEFAULT_COUNT),
    MAX_COUNT
  );

  if (!category) {
    return NextResponse.json(
      { error: "category parameter is required" },
      { status: 400 }
    );
  }

  try {
    const collected: Video[] = [];
    const seenIds = new Set<string>();
    let pageToken: string | undefined;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const { videos, nextPageToken } = await searchVideos(
        category,
        VIDEOS_PER_PAGE,
        pageToken
      );

      if (videos.length === 0) break;

      const filtered = await filterVideosWithAgent(
        videos,
        userProfile.interests,
        userProfile.description
      );

      for (const video of filtered) {
        if (!seenIds.has(video.id)) {
          seenIds.add(video.id);
          collected.push(video);
        }
      }

      if (collected.length >= targetCount || !nextPageToken) break;

      pageToken = nextPageToken;
    }

    return NextResponse.json(collected.slice(0, targetCount));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("not configured")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }
    if (message.toLowerCase().includes("quota")) {
      return NextResponse.json(
        { error: "Daily limit reached, try again tomorrow" },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
