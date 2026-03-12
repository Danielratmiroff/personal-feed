import { NextResponse } from "next/server";
import { searchVideos } from "@/lib/youtube";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const maxResults = parseInt(searchParams.get("maxResults") || "10", 10);

  if (!category) {
    return NextResponse.json(
      { error: "category parameter is required" },
      { status: 400 }
    );
  }

  try {
    const videos = await searchVideos(category, maxResults);
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
