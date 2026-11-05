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
  const cutoff = new Date(now.getTime() - NEW_POST_DURATION_MS).toISOString();
  const publications = [];
  const pageSize = 500;

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client
      .from("content_publications")
      .select("content_type, content_id, first_published_at")
      .eq("is_public", true)
      .gt("first_published_at", cutoff)
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

  const topicVoicePublications: RecentPublications["publications"] = [];
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client
      .from("interview_report")
      .select(
        "id, topic_voice_featured_at, interview_sessions!inner(interview_configs!inner(bill_id, bills!inner(source)))"
      )
      .eq("is_public_by_admin", true)
      .eq("is_public_by_user", true)
      .eq("interview_sessions.interview_configs.bills.source", "topic")
      .not("topic_voice_featured_at", "is", null)
      .gt("topic_voice_featured_at", cutoff)
      .lte("topic_voice_featured_at", now.toISOString())
      .order("id")
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(
        `生の声の初回掲載情報の取得に失敗しました: ${error.message}`
      );
    }

    topicVoicePublications.push(
      ...(data ?? []).flatMap((report) =>
        report.topic_voice_featured_at
          ? [
              {
                content_type: "topic_voice" as const,
                content_id: report.id,
                first_published_at: report.topic_voice_featured_at,
              },
            ]
          : []
      )
    );
    if ((data ?? []).length < pageSize) break;
  }

  return recentPublicationsSchema.parse({
    now: new Date().toISOString(),
    publications: [...publications, ...topicVoicePublications],
  });
}
