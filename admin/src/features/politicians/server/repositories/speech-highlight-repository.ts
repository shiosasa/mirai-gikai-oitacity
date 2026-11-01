import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import type { SpeechInput } from "../../shared/utils/speech-input";

export async function findSpeechHighlightsForAdmin() {
  const { data, error } = await createAdminClient()
    .from("politician_speech_highlights")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error)
    throw new Error(`議員の発言を取得できませんでした: ${error.message}`);
  return data ?? [];
}

export async function findSpeechPoliticians() {
  const { data, error } = await createAdminClient()
    .from("politicians")
    .select("id, name")
    .neq("name", "欠番")
    .order("name_kana", { ascending: true });
  if (error) throw new Error(`議員を取得できませんでした: ${error.message}`);
  return data ?? [];
}

export async function findSpeechSessions() {
  const db = createAdminClient();
  const pageSize = 1000;
  let offset = 0;
  const sessions: Awaited<ReturnType<typeof findSpeechSessionPage>> = [];
  while (true) {
    const page = await findSpeechSessionPage(db, offset, pageSize);
    sessions.push(...page);
    if (page.length < pageSize) return sessions;
    offset += page.length;
  }
}

async function findSpeechSessionPage(
  db: ReturnType<typeof createAdminClient>,
  offset: number,
  pageSize: number
) {
  const { data, error } = await db
    .from("meeting_sessions")
    .select(
      "id, meeting_id, session_title, date, meetings(id, title, meeting_type)"
    )
    .not("content", "is", null)
    .order("date", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + pageSize - 1);
  if (error) throw new Error(`議事録を取得できませんでした: ${error.message}`);
  return data ?? [];
}

export async function findSpeechSessionContent(id: number) {
  const { data, error } = await createAdminClient()
    .from("meeting_sessions")
    .select(
      "id, meeting_id, session_title, date, content, attendees, meetings(id, title, meeting_type)"
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`議事録を確認できませんでした: ${error.message}`);
  return data;
}

export async function saveSpeechHighlightRecord(input: SpeechInput) {
  const values = {
    politician_id: input.politicianId,
    meeting_session_id: input.sessionId,
    title: input.title,
    quote: input.quote,
    context: input.context || null,
    is_published: input.isPublished,
    updated_at: new Date().toISOString(),
  };
  const db = createAdminClient();
  const query = input.id
    ? db.from("politician_speech_highlights").update(values).eq("id", input.id)
    : db.from("politician_speech_highlights").insert(values);
  const { error } = await query.select("id").single();
  if (error) throw new Error(`発言を保存できませんでした: ${error.message}`);
}

export async function unpublishSpeechHighlightRecord(id: string) {
  const { error } = await createAdminClient()
    .from("politician_speech_highlights")
    .update({ is_published: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .single();
  if (error)
    throw new Error(`発言を非公開にできませんでした: ${error.message}`);
}
