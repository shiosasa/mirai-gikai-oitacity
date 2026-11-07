import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import { z } from "zod";
import {
  type TopicSource,
  type TopicSourceOption,
  validateTopicSources,
} from "../../shared/utils/topic-sources";

const sourceBillsSchema = z.array(
  z.object({ name: z.string(), number: z.string().nullable().optional() })
);

export async function findTopicSourceOptions(): Promise<TopicSourceOption[]> {
  const db = createAdminClient();
  const options: TopicSourceOption[] = [];
  for (let from = 0; ; from += 200) {
    const { data, error } = await db
      .from("meeting_sessions")
      .select(
        "id, date, session_title, bills, meetings!inner(id, title, meeting_type)"
      )
      .order("date", { ascending: false })
      .order("id", { ascending: false })
      .range(from, from + 199);
    if (error)
      throw new Error(`出典の開催日を取得できませんでした: ${error.message}`);
    for (const session of data ?? []) {
      if (!session.meetings.meeting_type) {
        throw new Error(
          "出典の会議区分が未設定です。議事録管理で確認してください"
        );
      }
      const bills = sourceBillsSchema.parse(session.bills ?? []);
      options.push({
        sessionId: session.id,
        meetingId: session.meetings.id,
        meetingType: session.meetings.meeting_type,
        meetingTitle: session.meetings.title ?? "",
        sessionLabel: session.session_title ?? "",
        date: session.date ?? "",
        bills: bills.map((bill) => ({
          name: bill.name,
          number: bill.number || null,
        })),
      });
    }
    if ((data?.length ?? 0) < 200) return options;
  }
}

export async function prepareTopicSources(sources: TopicSource[]) {
  if (!sources.length) return [];
  const validated = validateTopicSources(
    sources,
    await findTopicSourceOptions()
  );
  const quoted = validated.filter((source) => source.evidence_quote?.trim());
  if (quoted.length) {
    const { data, error } = await createAdminClient()
      .from("meeting_sessions")
      .select("id, content")
      .in("id", [...new Set(quoted.map((source) => source.session_id))]);
    if (error)
      throw new Error(`根拠引用を確認できませんでした: ${error.message}`);
    for (const source of quoted) {
      const content = data?.find(
        (session) => session.id === source.session_id
      )?.content;
      if (!content?.includes(source.evidence_quote ?? "")) {
        throw new Error(
          "根拠引用が出典の原文と一致しません。原文からそのままコピーしてください"
        );
      }
    }
  }
  return validated;
}
