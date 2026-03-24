import { NextResponse } from "next/server";
import { searchVideos } from "@/lib/youtube";
import { Video } from "@/types/video";
import { randomCount } from "@/lib/random";

const MAX_COUNT = 12;
const MAX_ITERATIONS = 3;
const VIDEOS_PER_PAGE = 25;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const countParam = searchParams.get("count");
  const targetCount = Math.min(
    Math.max(1, countParam ? Number(countParam) : randomCount()),
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

      for (const video of videos) {
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
