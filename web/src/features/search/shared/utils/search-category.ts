import type { TopicSourceRef } from "@/features/bills/shared/types";
import {
  ARTICLE_CATEGORIES,
  type ArticleCategoryFilter,
  filterArticlesByCategory,
  getCategoryLabel,
} from "@/features/bills/shared/utils/article-category";

type SearchableTopic = {
  title: string;
  category: string | null;
  source_refs?: TopicSourceRef[] | null;
} & Partial<
  Record<
    | "summary_line_1"
    | "summary_line_2"
    | "summary_line_3"
    | "details"
    | "reason"
    | "point_1"
    | "point_2"
    | "point_3"
    | "target_audience"
    | "positive_voice"
    | "cautious_voice",
    string | null
  >
>;

export function filterSearchTopics<T extends SearchableTopic>(
  articles: T[],
  query: string,
  category: ArticleCategoryFilter
): T[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return filterArticlesByCategory(articles, category).filter((article) =>
    [
      article.title,
      getCategoryLabel(article.category),
      article.category,
      article.summary_line_1,
      article.summary_line_2,
      article.summary_line_3,
      article.details,
      article.reason,
      article.point_1,
      article.point_2,
      article.point_3,
      article.target_audience,
      article.positive_voice,
      article.cautious_voice,
      ...(article.source_refs ?? []).flatMap((ref: TopicSourceRef) => [
        ref.meeting_title,
        ref.bill_name,
        ref.evidence_quote,
      ]),
    ].some((value) => value?.toLocaleLowerCase().includes(normalizedQuery))
  );
}

export function parseSearchCategory(
  value: string | undefined
): ArticleCategoryFilter {
  if (!value) return "すべて";
  const category = ARTICLE_CATEGORIES.find((item) => item === value);
  if (!category) throw new Error(`不明な検索カテゴリです: ${value}`);
  return category;
}

export function buildSearchUrl(
  query: string,
  category: ArticleCategoryFilter
): string {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (category !== "すべて") params.set("category", category);
  return params.size ? `/search?${params.toString()}` : "/search";
}
