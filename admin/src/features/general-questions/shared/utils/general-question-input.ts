import type { AdminGeneralQuestionTopic } from "../types";

export const GENERAL_QUESTION_CATEGORIES = [
  "子育て・教育",
  "安心・安全・防災",
  "まちづくり・暮らし",
  "まちの仕組み・選挙",
] as const;

export type GeneralQuestionInput = {
  council_session_id: string;
  politician_id: string | null;
  questioner_name: string;
  questioner_party: string | null;
  questioner_number: number | null;
  session_day: number;
  question_order: number;
  summary: string;
  source_url: string | null;
  publish_status: "draft" | "published";
  topics: AdminGeneralQuestionTopic[];
};

function requireNonEmpty(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label}を入力してください`);
  }
  return trimmed;
}

function toNullableText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

export function parseGeneralQuestionInput(
  raw: GeneralQuestionInput
): GeneralQuestionInput {
  const councilSessionId = requireNonEmpty(raw.council_session_id, "会期");
  const questionerName = requireNonEmpty(raw.questioner_name, "質問者名");
  const summary = requireNonEmpty(raw.summary, "全体概要");

  if (!Number.isInteger(raw.session_day) || raw.session_day < 1) {
    throw new Error("質問日は1以上の整数で入力してください");
  }
  if (!Number.isInteger(raw.question_order) || raw.question_order < 1) {
    throw new Error("質問順番は1以上の整数で入力してください");
  }
  if (raw.publish_status !== "draft" && raw.publish_status !== "published") {
    throw new Error("公開状態が不正です");
  }
  if (!Array.isArray(raw.topics) || raw.topics.length === 0) {
    throw new Error("トピックを1件以上追加してください");
  }

  const topics: AdminGeneralQuestionTopic[] = raw.topics.map((topic, index) => {
    const prefix = `トピック${index + 1}の`;
    return {
      title: requireNonEmpty(topic.title, `${prefix}タイトル`),
      category: toNullableText(topic.category),
      question_summary: requireNonEmpty(
        topic.question_summary,
        `${prefix}質問要約`
      ),
      answer_summary: requireNonEmpty(
        topic.answer_summary,
        `${prefix}答弁要約`
      ),
      answerer_role: topic.answerer_role.trim(),
      answerer_name: topic.answerer_name.trim(),
      question_raw_text: toNullableText(topic.question_raw_text),
      answer_raw_text: toNullableText(topic.answer_raw_text),
    };
  });

  const sourceUrl = toNullableText(raw.source_url);
  if (
    sourceUrl &&
    !sourceUrl.startsWith("/") &&
    !/^https?:\/\//.test(sourceUrl)
  ) {
    throw new Error("議事録要約ページURLは / または https:// で始めてください");
  }

  return {
    council_session_id: councilSessionId,
    politician_id: toNullableText(raw.politician_id),
    questioner_name: questionerName,
    questioner_party: toNullableText(raw.questioner_party),
    questioner_number:
      raw.questioner_number && Number.isInteger(raw.questioner_number)
        ? raw.questioner_number
        : null,
    session_day: raw.session_day,
    question_order: raw.question_order,
    summary,
    source_url: sourceUrl,
    publish_status: raw.publish_status,
    topics,
  };
}
