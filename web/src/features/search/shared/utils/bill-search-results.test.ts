import { describe, expect, it } from "vitest";
import { buildBillSearchResults } from "./bill-search-results";

const bill = {
  id: "bill",
  name: "条例改正",
  published_at: null,
  council_sessions: null,
  bill_contents: [{ title: "見出し", summary: "要約", content: "保育の本文" }],
  bills_tags: [{ tags: { label: "子育て・教育" } }],
};

describe("buildBillSearchResults", () => {
  it("keeps all bills beyond the old 50-result limit", () => {
    const bills = Array.from({ length: 75 }, (_, i) => ({
      ...bill,
      id: String(i),
    }));
    expect(buildBillSearchResults(bills, "")).toHaveLength(75);
  });

  it("keeps tagged bills even if their normal explanation has not been added", () => {
    expect(
      buildBillSearchResults([{ ...bill, bill_contents: [] }], "")[0]
    ).toMatchObject({
      title: "条例改正",
      summary: null,
      tags: ["子育て・教育"],
    });
  });

  it("combines a keyword with the searchable name, explanation and tags", () => {
    for (const keyword of ["条例", "見出し", "要約", " 保育 ", "子育て"]) {
      expect(buildBillSearchResults([bill], keyword)).toHaveLength(1);
    }
    expect(buildBillSearchResults([bill], "防災")).toEqual([]);
  });
});
