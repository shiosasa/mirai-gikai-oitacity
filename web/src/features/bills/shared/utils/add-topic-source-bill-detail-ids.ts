import type { TopicSourceRef } from "../types";

export type TopicBillDetailReference = {
  sessionId: number;
  billNumber: string | null;
  billName: string;
  billId: string;
};

type ArticleWithSourceRefs = {
  source_refs?: TopicSourceRef[] | null;
};

function normalizeReference(value: string): string {
  return value.normalize("NFKC").replace(/\s/g, "");
}

function matchesReference(
  source: TopicSourceRef,
  reference: TopicBillDetailReference
): boolean {
  if (source.session_id !== reference.sessionId) return false;

  if (source.bill_number && reference.billNumber) {
    return (
      normalizeReference(source.bill_number) ===
      normalizeReference(reference.billNumber)
    );
  }

  return Boolean(
    source.bill_name &&
      normalizeReference(source.bill_name) ===
        normalizeReference(reference.billName)
  );
}

export function addTopicSourceBillDetailIds<T extends ArticleWithSourceRefs>(
  articles: T[],
  references: TopicBillDetailReference[]
): (Omit<T, "source_refs"> & ArticleWithSourceRefs)[] {
  return articles.map((article) => ({
    ...article,
    source_refs: article.source_refs?.map((source) => {
      const matchingBillIds = new Set(
        references
          .filter((reference) => matchesReference(source, reference))
          .map((reference) => reference.billId)
      );
      const [billId] = matchingBillIds;

      return {
        ...source,
        detail_bill_id:
          matchingBillIds.size === 1 ? billId : (source.detail_bill_id ?? null),
      };
    }),
  }));
}
