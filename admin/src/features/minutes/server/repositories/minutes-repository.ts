import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import { z } from "zod";
import {
  type meetingInput,
  pageSize,
  type proposalInput,
  type sessionInput,
} from "@/features/content-management/shared/utils/content-input";

export async function listMeetings(page: number, type: string) {
  let query = createAdminClient()
    .from("meetings")
    .select("id, title, date, term, meeting_type", { count: "exact" })
    .order("date", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false });
  if (type) query = query.eq("meeting_type", type);
  const { data, error, count } = await query.range(
    (page - 1) * pageSize,
    page * pageSize - 1
  );
  if (error)
    throw new Error(`会議一覧を取得できませんでした: ${error.message}`);
  return { entries: data, count: count ?? 0 };
}

export async function getMeeting(id: number) {
  const { data, error } = await createAdminClient()
    .from("meetings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`会議を取得できませんでした: ${error.message}`);
  return data;
}

export async function listSessions(meetingId: number) {
  const { data, error } = await createAdminClient()
    .from("meeting_sessions")
    .select("id, date, session_title, summary")
    .eq("meeting_id", meetingId)
    .order("date")
    .order("id");
  if (error) throw new Error(`開催日を取得できませんでした: ${error.message}`);
  return data;
}

export async function getSession(meetingId: number, id: number) {
  const { data, error } = await createAdminClient()
    .from("meeting_sessions")
    .select("*")
    .eq("meeting_id", meetingId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`議事録を取得できませんでした: ${error.message}`);
  return data;
}

export async function saveMeetingRecord(
  id: number | null,
  input: z.infer<typeof meetingInput>
) {
  const db = createAdminClient();
  const query =
    id === null
      ? db.from("meetings").insert(input)
      : db.from("meetings").update(input).eq("id", id);
  const { data, error } = await query.select("id").single();
  if (error) throw new Error(`会議を保存できませんでした: ${error.message}`);
  return data.id;
}

export async function saveSessionRecord(
  meetingId: number,
  id: number | null,
  input: z.infer<typeof sessionInput>
) {
  const db = createAdminClient();
  const values = {
    ...input,
    attendees: z.json().parse(input.attendees),
    bills: z.json().parse(input.bills),
  };
  const query =
    id === null
      ? db.from("meeting_sessions").insert({ ...values, meeting_id: meetingId })
      : db
          .from("meeting_sessions")
          .update(values)
          .eq("id", id)
          .eq("meeting_id", meetingId);
  const { data, error } = await query.select("id").single();
  if (error) throw new Error(`議事録を保存できませんでした: ${error.message}`);
  return data.id;
}

export async function listProposalMeetings(page: number) {
  const { data, error, count } = await createAdminClient()
    .from("meetings")
    .select("id, title, date, term, mayor_proposal_text", { count: "exact" })
    .eq("meeting_type", "本会議")
    .order("date", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (error)
    throw new Error(`提案理由一覧を取得できませんでした: ${error.message}`);
  return { entries: data, count: count ?? 0 };
}

export async function saveProposalRecord(
  id: number,
  input: z.infer<typeof proposalInput>
) {
  const { error } = await createAdminClient()
    .from("meetings")
    .update(input)
    .eq("id", id)
    .eq("meeting_type", "本会議")
    .select("id")
    .single();
  if (error)
    throw new Error(`提案理由を保存できませんでした: ${error.message}`);
}
