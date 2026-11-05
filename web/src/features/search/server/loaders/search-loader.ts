import "server-only";
import { getPublishedArticles } from "@/features/bills/server/loaders/get-articles";
import type { ArticleCategoryFilter } from "@/features/bills/shared/utils/article-category";
import { getBillPickups } from "@/features/committee-minutes/server/loaders/get-bill-pickups";
import type { SearchResults } from "../../shared/types/search-types";
import { getCategorySearchScope } from "../../shared/utils/category-search-scope";
import { filterSearchTopics } from "../../shared/utils/search-category";
import {
  searchBills,
  searchCommittees,
} from "../repositories/search-repository";

export async function loadSearchResults(
  query: string,
  category: ArticleCategoryFilter = "すべて"
): Promise<SearchResults> {
  const [bills, articles, pickups] = await Promise.all([
    searchBills(query),
    getPublishedArticles(),
    category === "すべて" ? Promise.resolve([]) : getBillPickups(),
  ]);
  const scope =
    category === "すべて"
      ? null
      : getCategorySearchScope(pickups, articles, category);
  const committees = await searchCommittees(query, scope?.sessionIds);
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

  return {
    bills: scope
      ? bills.filter(
          (bill) => bill.tags.includes(category) || scope.billIds.has(bill.id)
        )
      : bills,
    topics,
    committees,
  };
}
