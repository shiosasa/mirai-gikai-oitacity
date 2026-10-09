import "server-only";
import { getPublishedArticles } from "@/features/bills/server/loaders/get-articles";
import type { TopicSourceRef } from "@/features/bills/shared/types";
import type { SearchResults } from "../../shared/types/search-types";
import {
  searchBills,
  searchCommittees,
} from "../repositories/search-repository";

export async function loadSearchResults(query: string): Promise<SearchResults> {
  const [bills, articles, committees] = await Promise.all([
    searchBills(query),
    getPublishedArticles(),
    searchCommittees(query),
  ]);
  const normalizedQuery = query.toLocaleLowerCase();
  const topics = articles
    .filter((article) =>
      [
        article.title,
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
          ref.bill_name ?? "",
          ref.evidence_quote ?? "",
        ]),
      ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery))
    )
    .map((article) => ({
      id: article.id,
      title: article.title,
      category: article.category,
      summary: [
        article.summary_line_1,
        article.summary_line_2,
        article.summary_line_3,
      ]
        .filter(Boolean)
        .join(" "),
    }));

  return { bills, topics, committees };
}
