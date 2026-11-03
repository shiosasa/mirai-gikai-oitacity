import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import type { z } from "zod";
import {
  type archiveInput,
  type archiveTopicInput,
  pageSize,
} from "@/features/content-management/shared/utils/content-input";

export async function listArchiveMeetings(
  page: number,
  status: string,
  committee: string
) {
  let query = createAdminClient()
    .from("committee_meetings")
    .select(
      "id, title, committee_name, committee_slug, meeting_date, publish_status, summary",
      { count: "exact" }
    )
    .order("meeting_date", { ascending: false })
    .order("id");
  if (status) query = query.eq("publish_status", status);
  if (committee) query = query.eq("committee_slug", committee);
  const { data, error, count } = await query.range(
    (page - 1) * pageSize,
    page * pageSize - 1
  );
  if (error)
    throw new Error(`アーカイブを取得できませんでした: ${error.message}`);
  return { entries: data, count: count ?? 0 };
}

export async function getArchiveMeeting(id: string) {
  const { data, error } = await createAdminClient()
    .from("committee_meetings")
    .select("*, committee_meeting_topics(*)")
    .eq("id", id)
    .maybeSingle();
  if (error)
    throw new Error(`アーカイブを取得できませんでした: ${error.message}`);
  return data;
}

export async function saveArchiveRecord(
  id: string,
  input: z.infer<typeof archiveInput>
) {
  const { error } = await createAdminClient()
    .from("committee_meetings")
    .update(input)
    .eq("id", id)
    .select("id")
    .single();
  if (error)
    throw new Error(`会議要約を保存できませんでした: ${error.message}`);
}

export async function saveArchiveTopicRecord(
  meetingId: string,
  id: string,
  input: z.infer<typeof archiveTopicInput>
) {
  const { error } = await createAdminClient()
    .from("committee_meeting_topics")
    .update(input)
    .eq("id", id)
    .eq("meeting_id", meetingId)
    .select("id")
    .single();
  if (error) throw new Error(`議題を保存できませんでした: ${error.message}`);
}
