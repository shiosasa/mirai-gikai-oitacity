import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import type { InformationInput } from "../../shared/utils/information-input";

export async function findInformationForAdmin() {
  const { data, error } = await createAdminClient()
    .from("site_information")
    .select("*")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });
  if (error)
    throw new Error(`お知らせを取得できませんでした: ${error.message}`);
  return data;
}

export async function saveInformationRecord(input: InformationInput) {
  const values = {
    title: input.title,
    body: input.body,
    published_at: input.publishedAt,
    is_published: input.isPublished,
    updated_at: new Date().toISOString(),
  };
  const db = createAdminClient();
  const query = input.id
    ? db.from("site_information").update(values).eq("id", input.id)
    : db.from("site_information").insert(values);
  const { error } = await query.select("id").single();
  if (error)
    throw new Error(`お知らせを保存できませんでした: ${error.message}`);
}
