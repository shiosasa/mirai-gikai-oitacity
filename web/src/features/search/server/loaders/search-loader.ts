import "server-only";
import { getPublishedArticles } from "@/features/bills/server/loaders/get-articles";
import type { ArticleCategoryFilter } from "@/features/bills/shared/utils/article-category";
import type { SearchResults } from "../../shared/types/search-types";
import { filterSearchTopics } from "../../shared/utils/search-category";
import {
  searchBills,
  searchCommittees,
} from "../repositories/search-repository";

export async function loadSearchResults(
  query: string,
  category: ArticleCategoryFilter = "すべて"
): Promise<SearchResults> {
  const [bills, articles, committees] = await Promise.all([
    category === "すべて" ? searchBills(query) : Promise.resolve([]),
    getPublishedArticles(),
    category === "すべて" ? searchCommittees(query) : Promise.resolve([]),
  ]);
  const topics = filterSearchTopics(articles, query, category).map(
    (article) => ({
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
    })
  );

  return { bills, topics, committees };
}
