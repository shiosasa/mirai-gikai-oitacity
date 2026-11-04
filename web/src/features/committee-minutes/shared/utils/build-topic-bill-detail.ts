import type { BillArticle } from "@/features/bills/shared/types";
import { getCategoryLabel } from "@/features/bills/shared/utils/article-category";
import type { BillPickupItem } from "./build-bill-pickup-items";

export function buildTopicBillDetail(
  item: BillPickupItem,
  article: Pick<
    BillArticle,
    | "id"
    | "title"
    | "source_refs"
    | "summary_line_1"
    | "summary_line_2"
    | "summary_line_3"
    | "details"
    | "reason"
    | "point_1"
    | "point_2"
    | "point_3"
    | "target_audience"
    | "category"
    | "updated_at"
  >
) {
  const sources = (article.source_refs ?? [])
    .filter(
      (source) =>
        source.detail_bill_id === item.billId &&
        source.detail_topic_id === article.id
    )
    .filter(
      (source, index, references) =>
        references.findIndex(
          (reference) =>
            reference.meeting_id === source.meeting_id &&
            reference.session_id === source.session_id &&
            reference.bill_number === source.bill_number
        ) === index
    );
  if (sources.length === 0) {
    throw new Error("トピックスと議案の対応を確認できません。");
  }
  const subtitle = article.title.match(/【([^】]+)】/)?.[1] ?? article.title;
  const summary = [
    article.summary_line_1,
    article.summary_line_2,
    article.summary_line_3,
  ]
    .filter((text) => text?.trim())
    .join("\n\n");
  if (!summary && !article.details?.trim()) {
    throw new Error("トピックスの説明本文が見つかりません。");
  }
  const points = [article.point_1, article.point_2, article.point_3]
    .filter((text) => text?.trim())
    .map((text) => `- ${text}`)
    .join("\n");
  const rest = [
    article.reason && `## 背景・理由\n${article.reason}`,
    points && `## 重要ポイント\n${points}`,
    article.target_audience &&
      `## 主に影響を受ける人・対象者\n${article.target_audience}`,
  ]
    .filter(Boolean)
    .join("\n\n");
  const category = getCategoryLabel(article.category);
  const categories = [
    "子育て・教育",
    "安心・安全・防災",
    "まちづくり・暮らし",
    "まちの仕組み・選挙",
  ].includes(category)
    ? [category]
    : [];
  const name =
    sources[0].bill_name?.replace(/[（(][^）)]+[）)]/g, "") ??
    item.references[0].billName;
  return {
    title: `${name}：${subtitle}`,
    normal: summary || article.details,
    hard: article.details,
    rest,
    item: {
      ...item,
      description: article.summary_line_1 || null,
      updatedAt: article.updated_at,
      categories,
      relatedTopicTitles: [article.title],
      references: sources.map((source) => ({
        meetingId: source.meeting_id,
        meetingTitle: source.meeting_title,
        meetingType: source.meeting_type,
        sessionId: source.session_id,
        date: source.date,
        billNumber: source.bill_number,
        billName: name,
        description: null,
      })),
    },
  };
}
