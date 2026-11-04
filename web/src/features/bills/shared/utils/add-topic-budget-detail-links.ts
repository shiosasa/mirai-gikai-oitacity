import type { BillArticle } from "../types";

type BillCandidate = {
  id: string;
  name: string;
  bill_number: string | null;
  publish_status: string;
  source: string;
};

function normalize(value: string): string {
  return value.normalize("NFKC").replace(/\s/g, "");
}

function budgetName(value: string): string | null {
  const name = normalize(value).replace(/[（(][^）)]+[）)]/g, "");
  return /^令和\d+年度大分市一般会計予算$/.test(name) ? name : null;
}

function billNumber(value: string): string | null {
  return normalize(value).match(/(?:議第|第)(\d+)号$/)?.[1] ?? null;
}

export function addTopicBudgetDetailLinks<
  T extends Pick<BillArticle, "id" | "source_refs">,
>(articles: T[], bills: BillCandidate[]): T[] {
  return articles.map((article) => ({
    ...article,
    source_refs: article.source_refs?.map((reference) => {
      const name = reference.bill_name && budgetName(reference.bill_name);
      const number = reference.bill_number && billNumber(reference.bill_number);
      if (!name || !number) return reference;
      const candidates = bills.filter(
        (bill) =>
          bill.source === "meeting" &&
          bill.publish_status === "published" &&
          budgetName(bill.name) === name &&
          bill.bill_number !== null &&
          billNumber(bill.bill_number) === number
      );
      if (candidates.length !== 1) {
        return { ...reference, detail_bill_id: null, detail_topic_id: null };
      }
      return {
        ...reference,
        detail_bill_id: candidates[0].id,
        detail_topic_id: article.id,
      };
    }),
  }));
}
