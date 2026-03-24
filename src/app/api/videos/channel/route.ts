import { NextResponse } from "next/server";
import { getChannelVideos } from "@/lib/youtube";
import { randomCount } from "@/lib/random";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get("channelId");
  const maxParam = searchParams.get("maxResults");
  const maxResults = Math.min(maxParam ? parseInt(maxParam, 10) : randomCount(), 12);

  if (!channelId) {
    return NextResponse.json(
      { error: "channelId parameter is required" },
      { status: 400 }
    );
  }

  try {
    const { videos } = await getChannelVideos(channelId, maxResults);
    return NextResponse.json(videos);
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
