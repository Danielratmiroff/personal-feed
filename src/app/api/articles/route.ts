import { NextRequest, NextResponse } from "next/server";
import { blogSources } from "@/config/interests";
import { fetchBlogArticles } from "@/lib/blogs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sourceSlug = searchParams.get("source");
  const maxResults = Math.min(
    Number(searchParams.get("maxResults")) || 15,
    30
  );

  if (!sourceSlug) {
    return NextResponse.json(
      { error: "Missing 'source' query parameter" },
      { status: 400 }
    );
  }

  const source = blogSources.find((s) => s.slug === sourceSlug);
  if (!source) {
    return NextResponse.json(
      { error: `Unknown source: ${sourceSlug}` },
      { status: 400 }
    );
  }

  try {
    const articles = await fetchBlogArticles(source, maxResults);
    return NextResponse.json(articles);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch articles";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
