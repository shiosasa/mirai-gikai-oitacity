import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";

export async function findPublishedSpeechHighlights(politicianId: string) {
  const { data, error } = await createAdminClient()
    .from("politician_speech_highlights")
    .select(
      "id, title, quote, context, meeting_sessions(id, meeting_id, date, content, meetings(id, title, meeting_type))"
    )
    .eq("politician_id", politicianId)
    .eq("is_published", true);

  if (error) {
    throw new Error(`議員の発言を取得できませんでした: ${error.message}`);
  }
  return data ?? [];
}
