import { query } from "@anthropic-ai/claude-agent-sdk";
import { Video } from "@/types/video";

export async function filterVideosWithAgent(
  videos: Video[],
  userInterests: string[],
  userDescription: string
): Promise<Video[]> {
  if (videos.length === 0) return [];

  const videoMetadata = videos.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    channelName: v.channelName,
  }));

  const systemPrompt = `You are a video relevance filter. Given a list of YouTube videos and a user profile, determine which videos are relevant to the user's interests.

Respond with ONLY a JSON array of video IDs that are relevant. No explanation, no markdown, just the JSON array.

Example response: ["abc123", "def456"]`;

  const userMessage = `User profile: ${userDescription}
User interests: ${userInterests.join(", ")}

Videos to evaluate:
${JSON.stringify(videoMetadata, null, 2)}

Return ONLY a JSON array of the IDs of videos that are relevant to this user's interests.`;

  try {
    const q = query({
      prompt: userMessage,
      options: {
        systemPrompt,
        permissionMode: "bypassPermissions",
        allowedTools: [],
        maxTurns: 1,
      },
    });

    let resultText = "";
    for await (const message of q) {
      if (message.type === "result" && "result" in message) {
        resultText = (message as { result: string }).result || "";
        break;
      }
    }

    if (!resultText) return videos;

    // Extract JSON array from response (handle possible markdown wrapping)
    const jsonMatch = resultText.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      return videos;
    }

    const relevantIds: string[] = JSON.parse(jsonMatch[0]);
    const idSet = new Set(relevantIds);
    const filtered = videos.filter((v) => idSet.has(v.id));

    return filtered.length > 0 ? filtered : videos;
  } catch {
    // Graceful degradation: return unfiltered videos on any error
    return videos;
  }
}
