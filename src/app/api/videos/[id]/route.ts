import { NextResponse } from "next/server";
import { getVideoById } from "@/lib/youtube";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const video = await getVideoById(id);
    return NextResponse.json(video);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message.includes("not configured")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
