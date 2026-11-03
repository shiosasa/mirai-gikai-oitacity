import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import type { TopicPublicationStatus } from "../../shared/utils/topic-publication";
import type { TopicEditInput } from "../../shared/utils/topic-edit";

export async function findTopicForEdit(id: string) {
  const db = createAdminClient();
  const { data: article, error } = await db
    .from("bill_articles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(`記事を取得できませんでした: ${error.message}`);
  const { data: proposal, error: proposalError } = await db
    .from("proposals")
    .select("*")
    .eq("id", article.bill_id)
    .single();
  if (proposalError)
    throw new Error(
      `記事の元データを取得できませんでした: ${proposalError.message}`
    );
  return { article, proposal };
}

export async function saveTopicContent(input: TopicEditInput) {
  const { id, expected_updated_at, ...content } = input;
  const { error } = await createAdminClient().rpc("save_admin_topic_content", {
    article_id: id,
    expected_updated_at,
    content_input: content,
  });
  if (error) throw new Error(`記事を保存できませんでした: ${error.message}`);
}

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
