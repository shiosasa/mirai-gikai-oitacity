import { describe, expect, it } from "vitest";
import {
  addBillPickupCategories,
  addBillPickupTagCategories,
  buildBillPickupItems,
} from "@/features/committee-minutes/shared/utils/build-bill-pickup-items";
import { getCategorySearchScope } from "./category-search-scope";

const source = {
  session_id: 30,
  meeting_id: 4,
  meeting_type: "委員会",
  meeting_title: "委員会",
  session_label: "",
  date: "",
  bill_number: null,
  bill_name: "記事の議案",
  evidence_quote: null,
};
const articles = [
  {
    id: "topic",
    title: "子育ての記事",
    category: "childcare_education",
    source_refs: [source, source],
  },
  { id: "other", title: "防災", category: "safety_disaster" },
];
const pickups = addBillPickupTagCategories(
  addBillPickupCategories(
    buildBillPickupItems([
      {
        id: 4,
        title: "委員会",
        meetingType: "委員会",
        sessions: [
          {
            id: 30,
            bills: [{ name: "記事の議案", number: null, billId: "linked" }],
          },
          {
            id: 31,
            bills: [{ name: "タグのみ", number: null, billId: "tagged" }],
          },
          { id: 32, bills: [{ name: "防災", number: null, billId: "other" }] },
          {
            id: 33,
            bills: [{ name: "タグのみ", number: null, billId: "tagged" }],
          },
        ],
      },
    ]),
    articles
  ),
  new Map([
    ["tagged", ["子育て・教育"]],
    ["other", ["安心・安全・防災"]],
  ])
);

describe("getCategorySearchScope", () => {
  it("includes bills classified by either related topics or bill tags", () => {
    const scope = getCategorySearchScope(pickups, articles, "子育て・教育");
    expect([...scope.billIds]).toEqual(["linked", "tagged"]);
    expect(scope.sessionIds).toEqual([30, 31, 33]);
  });

  it("includes topic source sessions even without a linked bill", () => {
    const scope = getCategorySearchScope([], articles, "子育て・教育");
    expect(scope.sessionIds).toEqual([30]);
    expect(scope.billIds.size).toBe(0);
  });

  it("does not include other categories or guess categories from keywords", () => {
    const scope = getCategorySearchScope(pickups, articles, "安心・安全・防災");
    expect([...scope.billIds]).toEqual(["other"]);
    expect(scope.sessionIds).toEqual([32]);
    expect(
      getCategorySearchScope(pickups, articles, "まちづくり・暮らし").sessionIds
    ).toEqual([]);
  });
});
