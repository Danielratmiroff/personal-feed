# Video Feed Web Application — Design Spec

A personal video discovery app that fetches YouTube videos based on interest categories and presents them in a Perplexity Discover-style grid layout.

## Architecture

Single **Next.js App Router** project. The frontend is React with Tailwind CSS. API routes proxy YouTube Data API calls to keep the API key server-side.

### Project Structure

```
src/
  app/
    page.tsx                — Main feed/discover page
    video/
      [id]/
        page.tsx            — Full-page video detail view
    layout.tsx              — Root layout (global styles, metadata)
    api/
      videos/
        route.ts            — GET /api/videos?category=AI
  components/
    VideoGrid.tsx           — Responsive grid of video tiles
    VideoCard.tsx           — Single tile (thumbnail, title, channel)
    VideoDetail.tsx         — Detail view (embedded player, description, channel info)
    CategoryTabs.tsx        — Tab bar for filtering by interest category
  config/
    interests.ts            — Hardcoded categories: ["AI", "AI Engineering"]
  lib/
    youtube.ts              — YouTube Data API client (search, video details)
  types/
    video.ts                — TypeScript types for video data
```

## API Layer

### `GET /api/videos`

**Query params:**
- `category` (required) — interest term to search for (e.g., "AI")
- `maxResults` (optional, default: 10) — number of videos to return

**Behavior:**
1. Reads `YOUTUBE_API_KEY` from `process.env` (system environment variable, no `.env.local` needed)
2. Calls YouTube Data API `search.list` with `q=category`, `type=video`, `part=snippet`, `order=relevance`
3. Maps response to a `Video` type
4. Returns JSON array of videos

**No caching for v1.** YouTube's free tier allows 10,000 units/day. `search.list` costs 100 units per call. With 2 categories, that's ~50 full page loads/day — sufficient for personal use.

**Error responses:** Returns `{ error: string }` with appropriate HTTP status codes.

### Video Type

```typescript
interface Video {
  id: string;
  title: string;
  thumbnail: string;       // mqdefault quality
  channelName: string;
  publishedAt: string;
  description: string;
}
```

## UI Components

### Feed Page (`/`)

- Header with app name
- **Category tab bar:** "All" | "AI" | "AI Engineering"
  - "All" selected by default, shows videos from all categories interleaved
  - Selecting a specific tab filters to that category
- **Responsive video grid:**
  - Desktop (1024px+): 4 columns
  - Tablet (768px): 2 columns
  - Mobile (<768px): 1 column

### Video Card (tile)

- YouTube thumbnail image (`mqdefault`)
- Video title (truncated to 2 lines)
- Channel name
- Published date (relative, e.g., "3 days ago")
- Hover effect: subtle scale or shadow

### Detail Page (`/video/[id]`)

URL-based routing so videos are shareable/bookmarkable.

- **Left side:** Large embedded YouTube player (iframe)
- **Right side:** Title, channel name, published date, full description
- **Top:** "Back to feed" link (preserves tab state)

### Loading & Empty States

- Skeleton cards while fetching
- "No videos found" message if a category returns empty results

## Data Flow

1. Page loads → fetches `GET /api/videos?category=<tab>` for the active tab (or all categories for "All")
2. API route calls YouTube Data API, maps and returns results
3. Frontend renders grid of `VideoCard` tiles
4. User clicks a tile → navigates to `/video/[id]`
5. Detail page fetches video metadata (or receives it via client-side state) and renders the embedded player + info

## Styling

- **Light theme** — white/light gray background, dark text
- **Tailwind CSS** — via Next.js built-in support, co-located with components
- Responsive breakpoints as defined above
- Hover effects on tiles (subtle scale or shadow)
- No animations beyond hover effects and page transitions

## Error Handling

| Scenario | API Response | Frontend Display |
|---|---|---|
| Missing API key | `500 { error: "YouTube API key not configured" }` | Message telling user to set the env variable |
| Quota exceeded | `403 { error: "Daily limit reached" }` | "Daily limit reached, try again tomorrow" |
| Other YouTube errors | `5xx { error: string }` | Generic error message with retry button |
| No results | `200 []` | "No videos found for [category]" |
| Network failure | N/A | Connection error message with retry |

All errors displayed inline where content would normally appear. No toasts or error boundaries.

## Testing

- **Test runner:** Vitest with React Testing Library
- **API route tests:** Verify correct YouTube API calls, response mapping, error handling (missing key, quota)
- **Component tests:** Basic render tests for `VideoCard` and `VideoGrid` with sample data
- **No E2E tests** for v1 — manual verification is sufficient for the app's size

## Configuration

Interest categories are hardcoded in `src/config/interests.ts`:

```typescript
export const interests = ["AI", "AI Engineering"];
```

To change categories, edit this file. No UI-based settings in v1.

## Out of Scope (v1)

- Dark theme
- User authentication
- Persistent preferences / database
- API response caching
- UI-based interest management
- E2E testing
