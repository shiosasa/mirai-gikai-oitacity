import type { BillSearchResult } from "../types/search-types";

type SearchableBill = {
  id: string;
  name: string;
  published_at: string | null;
  council_sessions: { name: string } | null;
  bill_contents: { title: string; summary: string; content: string }[];
  bills_tags: { tags: { label: string } | null }[];
};

export function buildBillSearchResults(
  bills: SearchableBill[],
  query: string
): BillSearchResult[] {
  const keyword = query.trim().toLocaleLowerCase();
  return bills
    .filter((bill) =>
      [
        bill.name,
        bill.council_sessions?.name,
        ...bill.bill_contents.flatMap((content) => [
          content.title,
          content.summary,
          content.content,
        ]),
        ...bill.bills_tags.map((item) => item.tags?.label),
      ].some((value) => value?.toLocaleLowerCase().includes(keyword))
    )
    .map((bill) => ({
      id: bill.id,
      title: bill.bill_contents[0]?.title || bill.name,
      summary: bill.bill_contents[0]?.summary ?? null,
      session: bill.council_sessions?.name ?? "",
      publishedAt: bill.published_at,
      tags: bill.bills_tags
        .map((item) => item.tags?.label)
        .filter((label): label is string => label != null),
    }));
}
