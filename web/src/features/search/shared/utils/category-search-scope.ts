import type { TopicSourceRef } from "@/features/bills/shared/types";
import {
  type ArticleCategoryFilter,
  filterArticlesByCategory,
} from "@/features/bills/shared/utils/article-category";
import type { BillPickupItem } from "@/features/committee-minutes/shared/utils/build-bill-pickup-items";

export function getCategorySearchScope(
  pickups: BillPickupItem[],
  articles: {
    category: string | null;
    source_refs?: TopicSourceRef[] | null;
  }[],
  category: ArticleCategoryFilter
) {
  const bills = pickups.filter((item) => item.categories.includes(category));
  return {
    billIds: new Set(bills.map((item) => item.billId)),
    sessionIds: [
      ...new Set([
        ...bills.flatMap((item) =>
          item.references.map((reference) => reference.sessionId)
        ),
        ...filterArticlesByCategory(articles, category).flatMap((article) =>
          (article.source_refs ?? []).map((reference) => reference.session_id)
        ),
      ]),
    ],
  };
}
