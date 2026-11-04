import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import {
  type RecentPublications,
  recentPublicationsSchema,
} from "../../shared/types";
import { NEW_POST_DURATION_MS } from "../../shared/utils/publication-window";

export async function findRecentPublications(): Promise<RecentPublications> {
  const client = createAdminClient();
  const now = new Date();
  const publications = [];
  const pageSize = 500;

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client
      .from("content_publications")
      .select("content_type, content_id, first_published_at")
      .eq("is_public", true)
      .gt(
        "first_published_at",
        new Date(now.getTime() - NEW_POST_DURATION_MS).toISOString()
      )
      .lte("first_published_at", now.toISOString())
      .order("content_type")
      .order("content_id")
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(`初回公開情報の取得に失敗しました: ${error.message}`);
    }
    publications.push(...data);
    if (data.length < pageSize) break;
  }

  return recentPublicationsSchema.parse({
    now: new Date().toISOString(),
    publications,
  });
}
