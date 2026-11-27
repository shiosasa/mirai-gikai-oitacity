import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import type {
  AdminGeneralQuestion,
  CouncilSessionOption,
  PoliticianOption,
} from "../../shared/types";
import type { GeneralQuestionInput } from "../../shared/utils/general-question-input";

export async function findAllGeneralQuestions(): Promise<
  AdminGeneralQuestion[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("general_questions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`一般質問の取得に失敗しました: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    ...row,
    topics: Array.isArray(row.topics) ? row.topics : [],
  })) as AdminGeneralQuestion[];
}

export async function findGeneralQuestionById(
  id: string
): Promise<AdminGeneralQuestion | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("general_questions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`一般質問の取得に失敗しました: ${error.message}`);
  }
  if (!data) return null;

  return {
    ...data,
    topics: Array.isArray(data.topics) ? data.topics : [],
  } as AdminGeneralQuestion;
}

export async function findGeneralQuestionFormOptions(): Promise<{
  sessions: CouncilSessionOption[];
  politicians: PoliticianOption[];
}> {
  const supabase = createAdminClient();
  const [{ data: sessions }, { data: politicians }] = await Promise.all([
    supabase
      .from("council_sessions")
      .select("id, name")
      .order("start_date", { ascending: false }),
    supabase
      .from("politicians")
      .select("id, name, faction, seat_number")
      .order("seat_number", { ascending: true }),
  ]);

  return {
    sessions: (sessions ?? []) as CouncilSessionOption[],
    politicians: (politicians ?? []) as PoliticianOption[],
  };
}

export async function createGeneralQuestionRecord(
  input: GeneralQuestionInput
): Promise<string> {
  const supabase = createAdminClient();
  const rawText = input.topics
    .map((t) => t.question_raw_text)
    .filter(Boolean)
    .join("\n\n---\n\n");
  const answerRawText = input.topics
    .map((t) => t.answer_raw_text)
    .filter(Boolean)
    .join("\n\n---\n\n");

  const { data, error } = await supabase
    .from("general_questions")
    .insert({
      council_session_id: input.council_session_id,
      politician_id: input.politician_id,
      questioner_name: input.questioner_name,
      questioner_party: input.questioner_party,
      questioner_number: input.questioner_number,
      session_day: input.session_day,
      question_order: input.question_order,
      summary: input.summary,
      topics: input.topics,
      raw_text: rawText || "",
      answer_raw_text: answerRawText || "",
      source_url: input.source_url,
      publish_status: input.publish_status,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`一般質問の作成に失敗しました: ${error?.message}`);
  }
  return data.id;
}

export async function updateGeneralQuestionRecord(
  id: string,
  input: GeneralQuestionInput
): Promise<void> {
  const supabase = createAdminClient();
  const rawText = input.topics
    .map((t) => t.question_raw_text)
    .filter(Boolean)
    .join("\n\n---\n\n");
  const answerRawText = input.topics
    .map((t) => t.answer_raw_text)
    .filter(Boolean)
    .join("\n\n---\n\n");

  const { error } = await supabase
    .from("general_questions")
    .update({
      council_session_id: input.council_session_id,
      politician_id: input.politician_id,
      questioner_name: input.questioner_name,
      questioner_party: input.questioner_party,
      questioner_number: input.questioner_number,
      session_day: input.session_day,
      question_order: input.question_order,
      summary: input.summary,
      topics: input.topics,
      raw_text: rawText || "",
      answer_raw_text: answerRawText || "",
      source_url: input.source_url,
      publish_status: input.publish_status,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`一般質問の更新に失敗しました: ${error.message}`);
  }
}

export async function setGeneralQuestionPublishStatus(
  id: string,
  publishStatus: "draft" | "published"
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("general_questions")
    .update({ publish_status: publishStatus })
    .eq("id", id);

  if (error) {
    throw new Error(`公開状態の更新に失敗しました: ${error.message}`);
  }
}

export async function deleteGeneralQuestionRecord(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("general_questions")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`一般質問の削除に失敗しました: ${error.message}`);
  }
}
