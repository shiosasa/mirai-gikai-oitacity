import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import type { TopicPublicationStatus } from "../../shared/utils/topic-publication";

export async function findTopicsForAdmin() {
  const { data, error } = await createAdminClient()
    .from("bill_articles")
    .select(
      "id, title, publish_status, first_published_at, proposals(published_date)"
    )
    .order("created_at", { ascending: false });
  if (error)
    throw new Error(`トピックスの取得に失敗しました: ${error.message}`);
  return data;
}

export async function updateTopicPublication(
  id: string,
  status: TopicPublicationStatus
) {
  const { data, error } = await createAdminClient()
    .from("bill_articles")
    .update({ publish_status: status })
    .eq("id", id)
    .select("id")
    .single();
  if (error) throw new Error(`公開状態の更新に失敗しました: ${error.message}`);
  return data;
}
