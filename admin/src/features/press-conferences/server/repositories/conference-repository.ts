import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import type { z } from "zod";
import {
  type conferenceInput,
  type conferenceItemInput,
  type conferenceTurnInput,
  pageSize,
} from "@/features/content-management/shared/utils/content-input";

export async function listConferences(page: number, status: string) {
  let query = createAdminClient()
    .from("press_conferences")
    .select("id, title, held_at, status, press_conference_items(count)", {
      count: "exact",
    })
    .order("held_at", { ascending: false })
    .order("id");
  if (status) query = query.eq("status", status);
  const { data, error, count } = await query.range(
    (page - 1) * pageSize,
    page * pageSize - 1
  );
  if (error)
    throw new Error(`記者会見を取得できませんでした: ${error.message}`);
  return { entries: data, count: count ?? 0 };
}

export async function getConference(id: string) {
  const { data, error } = await createAdminClient()
    .from("press_conferences")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error)
    throw new Error(`記者会見を取得できませんでした: ${error.message}`);
  return data;
}

export async function getConferenceItems(id: string) {
  const { data, error } = await createAdminClient()
    .from("press_conference_items")
    .select("*, press_conference_turns(*)")
    .eq("press_conference_id", id)
    .order("order_index")
    .order("id");
  if (error)
    throw new Error(`発表・質疑を取得できませんでした: ${error.message}`);
  return data;
}

export async function saveConferenceRecord(
  id: string | null,
  input: z.infer<typeof conferenceInput>
) {
  const db = createAdminClient();
  if (input.status === "published") {
    if (!id)
      throw new Error(
        "まず下書きとして保存し、発表・質疑を追加してから公開してください"
      );
    const { count, error } = await db
      .from("press_conference_items")
      .select("id", { count: "exact", head: true })
      .eq("press_conference_id", id);
    if (error) throw new Error(`公開前の確認に失敗しました: ${error.message}`);
    if (!count) throw new Error("公開する前に発表または質疑を追加してください");
  }
  const values = {
    ...input,
    youtube_url: input.youtube_url || null,
    updated_at: new Date().toISOString(),
  };
  const query =
    id === null
      ? db.from("press_conferences").insert(values)
      : db.from("press_conferences").update(values).eq("id", id);
  const { data, error } = await query.select("id").single();
  if (error)
    throw new Error(`記者会見を保存できませんでした: ${error.message}`);
  return data.id;
}

export async function saveConferenceItemRecord(
  conferenceId: string,
  id: string | null,
  input: z.infer<typeof conferenceItemInput>
) {
  const db = createAdminClient();
  const values = { ...input, material_url: input.material_url || null };
  const query =
    id === null
      ? db
          .from("press_conference_items")
          .insert({ ...values, press_conference_id: conferenceId })
      : db
          .from("press_conference_items")
          .update(values)
          .eq("id", id)
          .eq("press_conference_id", conferenceId);
  const { error } = await query.select("id").single();
  if (error)
    throw new Error(`発表・質疑を保存できませんでした: ${error.message}`);
}

export async function deleteConferenceItemRecord(
  conferenceId: string,
  id: string
) {
  const { error } = await createAdminClient()
    .from("press_conference_items")
    .delete()
    .eq("id", id)
    .eq("press_conference_id", conferenceId)
    .select("id")
    .single();
  if (error) throw new Error(`項目を削除できませんでした: ${error.message}`);
}

async function requireConferenceItem(conferenceId: string, itemId: string) {
  const { error } = await createAdminClient()
    .from("press_conference_items")
    .select("id")
    .eq("id", itemId)
    .eq("press_conference_id", conferenceId)
    .single();
  if (error)
    throw new Error(`対象の会見項目を確認できませんでした: ${error.message}`);
}

export async function saveConferenceTurnRecord(
  conferenceId: string,
  itemId: string,
  id: string | null,
  input: z.infer<typeof conferenceTurnInput>
) {
  await requireConferenceItem(conferenceId, itemId);
  const db = createAdminClient();
  const query =
    id === null
      ? db
          .from("press_conference_turns")
          .insert({ ...input, press_conference_item_id: itemId })
      : db
          .from("press_conference_turns")
          .update(input)
          .eq("id", id)
          .eq("press_conference_item_id", itemId);
  const { error } = await query.select("id").single();
  if (error) throw new Error(`発言を保存できませんでした: ${error.message}`);
}

export async function deleteConferenceTurnRecord(
  conferenceId: string,
  itemId: string,
  id: string
) {
  await requireConferenceItem(conferenceId, itemId);
  const { error } = await createAdminClient()
    .from("press_conference_turns")
    .delete()
    .eq("id", id)
    .eq("press_conference_item_id", itemId)
    .select("id")
    .single();
  if (error) throw new Error(`発言を削除できませんでした: ${error.message}`);
}
