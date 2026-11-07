import { getRelatedLinks } from "@mirai-gikai/shared/bills/related-links";
import type { Database } from "@mirai-gikai/supabase";
import { z } from "zod";
import {
  dateInput,
  httpUrl,
  optionalText,
  recordId,
  titleInput,
} from "@/features/content-management/shared/utils/content-input";
import { topicSourcesSchema } from "./topic-sources";

export const topicCategories = [
  { value: "childcare_education", label: "子育て・教育" },
  { value: "safety_disaster", label: "安心・安全・防災" },
  { value: "community_living", label: "まちづくり・暮らし" },
  { value: "governance_election", label: "まちの仕組み・選挙" },
] as const;

export const topicContentSchema = z.object({
  title: titleInput,
  category: z.enum(topicCategories.map((category) => category.value)),
  status_label: z.string().trim().min(1, "状況を入力してください").max(100),
  status_class: z.string().max(100),
  summary_line_1: optionalText,
  summary_line_2: optionalText,
  summary_line_3: optionalText,
  details: optionalText,
  reason: optionalText,
  point_1: optionalText,
  point_2: optionalText,
  point_3: optionalText,
  target_audience: optionalText,
  positive_voice: optionalText,
  cautious_voice: optionalText,
  link_label: z.string().max(200),
  link_url: httpUrl,
  related_links: z
    .array(
      z.object({
        label: z.string().trim().max(200),
        url: httpUrl.refine(
          (value) => !!value,
          "関連リンクURLを入力してください"
        ),
      })
    )
    .default([]),
  decision_date: z.union([dateInput, z.literal("")]),
  source_refs: topicSourcesSchema.default([]),
});

export const topicEditSchema = topicContentSchema.extend({
  id: recordId,
  expected_updated_at: z.string().min(1),
});

export type TopicContentInput = z.infer<typeof topicContentSchema>;
export type TopicEditInput = z.infer<typeof topicEditSchema>;
export type TopicFormValues = TopicContentInput &
  Partial<Pick<TopicEditInput, "id" | "expected_updated_at">>;
type Article = Database["public"]["Tables"]["bill_articles"]["Row"];
type Proposal = Database["public"]["Tables"]["proposals"]["Row"];

export function getTopicEditValues(
  article: Article,
  proposal: Proposal | null
): TopicEditInput {
  const category =
    topicCategories.find((item) => item.label === proposal?.badge)?.value ??
    article.category;
  return topicEditSchema.parse({
    id: article.id,
    title: article.title,
    category,
    status_label: proposal?.status || article.status_label,
    status_class: proposal?.statusClass || article.status_class,
    summary_line_1: proposal?.summary1 || article.summary_line_1,
    summary_line_2: proposal?.summary2 || article.summary_line_2,
    summary_line_3: proposal?.summary3 || article.summary_line_3,
    details: proposal?.gikaiDetail || article.details,
    reason: proposal?.reason || article.reason,
    point_1: proposal?.point1 || article.point_1,
    point_2: proposal?.point2 || article.point_2,
    point_3: proposal?.point3 || article.point_3,
    target_audience: proposal?.impact || article.target_audience,
    positive_voice: proposal?.pro || article.positive_voice,
    cautious_voice: proposal?.con || article.cautious_voice,
    link_label: article.link_label ?? "",
    link_url: article.link_url ?? "",
    related_links: getRelatedLinks(article),
    decision_date: article.decision_date ?? "",
    expected_updated_at: article.updated_at,
    source_refs: article.source_refs ?? [],
  });
}

export function getEmptyTopicValues(): TopicContentInput {
  return {
    title: "",
    ...topicContentSchema.omit({ title: true }).parse({
      category: "childcare_education",
      status_label: "審議中",
      status_class: "status-review",
      summary_line_1: "",
      summary_line_2: "",
      summary_line_3: "",
      details: "",
      reason: "",
      point_1: "",
      point_2: "",
      point_3: "",
      target_audience: "",
      positive_voice: "",
      cautious_voice: "",
      link_label: "",
      link_url: "",
      decision_date: "",
    }),
  };
}

export function topicFormData(data: FormData) {
  const rawSources = data.get("source_refs");
  const rawLinks = data.get("related_links");
  return {
    ...Object.fromEntries(data),
    source_refs:
      typeof rawSources === "string" ? JSON.parse(rawSources) : undefined,
    related_links:
      typeof rawLinks === "string" ? JSON.parse(rawLinks) : undefined,
  };
}

export function parseTopicEditForm(data: FormData): TopicEditInput {
  return topicEditSchema.parse(topicFormData(data));
}
