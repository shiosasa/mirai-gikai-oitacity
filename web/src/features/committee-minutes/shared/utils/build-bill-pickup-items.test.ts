import { describe, expect, it } from "vitest";
import {
  addBillPickupCategories,
  addBillPickupTagCategories,
  addBillPickupTitles,
  addBillPickupUpdatedAt,
  buildBillPickupItems,
  filterBillPickupItems,
  formatBillPickupNumber,
  getBillPickupHeading,
  getBillPickupKind,
  sortBillPickupItemsByUpdatedAt,
} from "./build-bill-pickup-items";

describe("buildBillPickupItems", () => {
  it("only lists bill detail pages linked from minutes", () => {
    const items = buildBillPickupItems([
      {
        id: 1,
        title: "本会議",
        meetingType: "本会議",
        sessions: [
          {
            id: 10,
            date: "2026-03-05",
            bills: [
              {
                number: "議第35号",
                name: "学校給食費条例改正",
                description: "学校給食費の管理方法を改める条例案です。",
                billId: "bill-35",
              },
              { number: "議第1号", name: "一般会計予算", billId: null },
            ],
          },
        ],
      },
    ]);

    expect(items).toEqual([
      {
        billId: "bill-35",
        title: null,
        description: "学校給食費の管理方法を改める条例案です。",
        kind: "法案",
        updatedAt: null,
        status: null,
        categories: [],
        relatedTopicTitles: [],
        references: [
          {
            meetingId: 1,
            meetingTitle: "本会議",
            meetingType: "本会議",
            sessionId: 10,
            date: "2026-03-05",
            billNumber: "議第35号",
            billName: "学校給食費条例改正",
            description: "学校給食費の管理方法を改める条例案です。",
          },
        ],
      },
    ]);
  });

  it("groups repeated minutes references by the linked detail page", () => {
    const items = buildBillPickupItems([
      {
        id: 1,
        title: "本会議",
        meetingType: "本会議",
        sessions: [
          {
            id: 10,
            date: "2026-03-05",
            bills: [
              {
                number: "議第35号",
                name: "学校給食費条例改正",
                description: "給食費条例の管理について改正します。",
                billId: "bill-35",
              },
            ],
          },
          {
            id: 1,
            date: "2026-03-26",
            bills: [
              {
                number: "議第35号",
                name: "学校給食費条例改正",
                description: "給食費条例の管理について改正します。",
                billId: "bill-35",
              },
              {
                number: "議第1号",
                name: "一般会計予算",
                billId: "bill-1",
              },
            ],
          },
        ],
      },
    ]);

    expect(items).toHaveLength(2);
    expect(items[0].billId).toBe("bill-35");
    expect(items[0].description).toBe("給食費条例の管理について改正します。");
    expect(items[0].references).toHaveLength(2);
    expect(items[1].billId).toBe("bill-1");
  });

  it("returns an empty list when no minute entry has a detail link", () => {
    expect(
      buildBillPickupItems([
        {
          id: 1,
          title: "委員会",
          meetingType: "委員会",
          sessions: [
            {
              id: 20,
              bills: [{ number: null, name: "リンクなし議案" }],
            },
          ],
        },
      ])
    ).toEqual([]);
  });

  it("attaches unique categories from a matching pickup article", () => {
    const items = buildBillPickupItems([
      {
        id: 1,
        title: "本会議",
        meetingType: "本会議",
        sessions: [
          {
            id: 10,
            bills: [
              {
                number: "議第35号",
                name: "学校給食費条例改正",
                billId: "bill-35",
              },
            ],
          },
        ],
      },
    ]);

    expect(
      addBillPickupCategories(items, [
        {
          title: "学校給食費無償化",
          category: "childcare_education",
          source_refs: [
            {
              session_id: 10,
              bill_number: "議第35号",
              bill_name: "学校給食費条例改正",
            },
          ],
        },
        {
          title: "別の話題",
          category: "safety_disaster",
          source_refs: [
            {
              session_id: 10,
              bill_number: "議第1号",
              bill_name: "別の議案",
            },
          ],
        },
        {
          title: "同じ議案名だが異なる番号",
          category: "safety_disaster",
          source_refs: [
            {
              session_id: 10,
              bill_number: "議第1号",
              bill_name: "学校給食費条例改正",
            },
          ],
        },
      ])[0]
    ).toMatchObject({
      categories: ["子育て・教育"],
      relatedTopicTitles: ["学校給食費無償化"],
    });
  });

  it("attaches categories from bill tags when no article matches", () => {
    const items = buildBillPickupItems([
      {
        id: 1,
        title: "本会議",
        meetingType: "本会議",
        sessions: [
          {
            id: 10,
            bills: [
              {
                number: "議第73号",
                name: "市有財産の処分について",
                billId: "bill-73",
              },
            ],
          },
        ],
      },
    ]);

    const result = addBillPickupTagCategories(
      addBillPickupCategories(items, []),
      new Map([["bill-73", ["子育て・教育", "対象外タグ"]]])
    )[0];

    expect(result.categories).toEqual(["子育て・教育"]);
  });

  it("merges tag categories with article categories without duplicates", () => {
    const items = buildBillPickupItems([
      {
        id: 1,
        title: "本会議",
        meetingType: "本会議",
        sessions: [
          {
            id: 10,
            bills: [
              {
                number: "議第35号",
                name: "学校給食費条例改正",
                billId: "bill-35",
              },
            ],
          },
        ],
      },
    ]);

    const withArticleCategories = addBillPickupCategories(items, [
      {
        title: "学校給食費無償化",
        category: "childcare_education",
        source_refs: [
          {
            session_id: 10,
            bill_number: "議第35号",
            bill_name: "学校給食費条例改正",
          },
        ],
      },
    ]);

    const result = addBillPickupTagCategories(
      withArticleCategories,
      new Map([["bill-35", ["子育て・教育", "安心・安全・防災"]]])
    )[0];

    expect(result.categories).toEqual(["子育て・教育", "安心・安全・防災"]);
  });

  it("keeps items unchanged when they have no tags", () => {
    const items = buildBillPickupItems([
      {
        id: 1,
        title: "本会議",
        meetingType: "本会議",
        sessions: [
          {
            id: 10,
            bills: [
              {
                number: "議第1号",
                name: "一般会計予算",
                billId: "bill-1",
              },
            ],
          },
        ],
      },
    ]);

    const result = addBillPickupTagCategories(items, new Map())[0];

    expect(result.categories).toEqual([]);
  });

  it("filters by category", () => {
    const items = [
      {
        billId: "bill-2",
        title: null,
        description: null,
        kind: "法案" as const,
        updatedAt: null,
        status: null,
        categories: ["安心・安全・防災"],
        relatedTopicTitles: [],
        references: [
          {
            meetingId: 1,
            meetingTitle: "本会議",
            meetingType: "本会議",
            sessionId: 1,
            date: "2026-03-05",
            billNumber: "議第10号",
            billName: "防災条例",
            description: null,
          },
        ],
      },
      {
        billId: "bill-1",
        title: null,
        description: null,
        kind: "法案" as const,
        updatedAt: null,
        status: null,
        categories: ["子育て・教育"],
        relatedTopicTitles: [],
        references: [
          {
            meetingId: 1,
            meetingTitle: "本会議",
            meetingType: "本会議",
            sessionId: 2,
            date: "2026-03-26",
            billNumber: "議第2号",
            billName: "子育て支援条例",
            description: null,
          },
        ],
      },
    ];

    expect(
      filterBillPickupItems(items, "子育て・教育").map((item) => item.billId)
    ).toEqual(["bill-1"]);
    expect(filterBillPickupItems(items, "すべて")).toHaveLength(2);
  });

  it("distinguishes budget, petition, and bill entries", () => {
    expect(getBillPickupKind("議第1号", "令和8年度大分市一般会計予算")).toBe(
      "予算"
    );
    expect(getBillPickupKind("令和8年陳情第1号", "陳情")).toBe("陳情");
    expect(getBillPickupKind("令和8年請願第1号", "請願")).toBe("陳情");
    expect(getBillPickupKind("議第35号", "学校給食費条例改正")).toBe("法案");
  });

  it("uses a descriptive heading for general account budget entries", () => {
    expect(
      getBillPickupHeading(
        "令和8年度大分市一般会計予算",
        "来年度（令和8年度）の大分市全体の基本的な予算を定めるもの。"
      )
    ).toBe("大分市全体の令和8年度予算");
    expect(
      getBillPickupHeading("令和8年度大分市一般会計予算", "来年度の予算案。", [
        "【有害鳥獣捕獲事業】イノシシ被害から暮らしを守る！議会が予算増額と新技術導入を提言",
      ])
    ).toBe("令和8年度予算（イノシシ被害対策）");
    expect(
      getBillPickupHeading("令和8年度大分市一般会計予算", null, [
        "【有害鳥獣捕獲事業】イノシシ被害対策について",
      ])
    ).toBe("令和8年度予算（イノシシ被害対策）");
  });

  it("prefers the plain-language title over the official name and budget headings", () => {
    expect(
      getBillPickupHeading(
        "大分市学校給食費の管理に関する条例の一部改正について",
        null,
        [],
        "学校給食費のルールを変えます"
      )
    ).toBe("学校給食費のルールを変えます");
    expect(
      getBillPickupHeading(
        "令和8年度大分市一般会計予算",
        "来年度の予算案。",
        ["【有害鳥獣捕獲事業】イノシシ被害について"],
        "イノシシ対策のお金を増やします"
      )
    ).toBe("イノシシ対策のお金を増やします");
  });

  it("falls back to the official name when the plain-language title is blank", () => {
    expect(getBillPickupHeading("市有財産の処分について", null, [], null)).toBe(
      "市有財産の処分について"
    );
    expect(getBillPickupHeading("市有財産の処分について", null, [], "  ")).toBe(
      "市有財産の処分について"
    );
  });

  it("adds plain-language titles to listed bills", () => {
    const items = buildBillPickupItems([
      {
        id: 1,
        title: "本会議",
        meetingType: "本会議",
        sessions: [
          {
            id: 10,
            bills: [
              {
                number: "議第35号",
                name: "学校給食費条例改正",
                billId: "bill-35",
              },
              { number: "議第36号", name: "別の条例改正", billId: "bill-36" },
            ],
          },
        ],
      },
    ]);

    const withTitles = addBillPickupTitles(
      items,
      new Map([["bill-35", " 学校給食費のルールを変えます "]])
    );
    expect(withTitles.map((item) => item.title)).toEqual([
      "学校給食費のルールを変えます",
      null,
    ]);
  });

  it("adds the bill update date to listed detail pages", () => {
    const items = buildBillPickupItems([
      {
        id: 1,
        title: "本会議",
        meetingType: "本会議",
        sessions: [
          {
            id: 10,
            bills: [
              {
                number: "議第35号",
                name: "学校給食費条例改正",
                billId: "bill-35",
              },
            ],
          },
        ],
      },
    ]);

    expect(
      addBillPickupUpdatedAt(
        items,
        new Map([["bill-35", "2026-10-08T00:00:00.000Z"]])
      )[0].updatedAt
    ).toBe("2026-10-08T00:00:00.000Z");
  });

  it("prefixes ordinary bill numbers with the Reiwa year", () => {
    expect(formatBillPickupNumber("議第75号", "2026-06-26")).toBe(
      "令和8年 議第75号"
    );
    expect(formatBillPickupNumber("令和8年陳情第1号", "2026-06-26")).toBe(
      "令和8年陳情第1号"
    );
    expect(formatBillPickupNumber("議第1号", "")).toBe("議第1号");
  });
});

describe("sortBillPickupItemsByUpdatedAt", () => {
  const item = (billId: string, updatedAt: string | null) => ({
    billId,
    title: null,
    description: null,
    kind: "法案" as const,
    updatedAt,
    status: null,
    categories: [],
    relatedTopicTitles: [],
    references: [],
  });

  it("puts the most recently updated bills first and undated bills last", () => {
    const sorted = sortBillPickupItemsByUpdatedAt([
      item("old", "2026-10-10T01:50:33.049923+00:00"),
      item("none", null),
      item("new", "2026-10-31T13:26:21.491147+00:00"),
      item("mid", "2026-10-31T13:26:21.252802+00:00"),
    ]);
    expect(sorted.map((entry) => entry.billId)).toEqual([
      "new",
      "mid",
      "old",
      "none",
    ]);
  });

  it("keeps the original order for equal timestamps", () => {
    const sorted = sortBillPickupItemsByUpdatedAt([
      item("a", "2026-10-10T00:00:00Z"),
      item("b", "2026-10-10T00:00:00Z"),
    ]);
    expect(sorted.map((entry) => entry.billId)).toEqual(["a", "b"]);
  });
});
