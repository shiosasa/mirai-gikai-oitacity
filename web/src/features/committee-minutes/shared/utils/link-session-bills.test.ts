import { describe, expect, it } from "vitest";
import { linkSessionBills } from "./link-session-bills";

describe("linkSessionBills", () => {
  it("links a meeting bill when its exact name and number match a published bill", () => {
    const result = linkSessionBills(
      [
        {
          number: "第1号",
          name: "子育て支援条例",
          description: null,
          result: "可決",
        },
      ],
      [
        {
          id: "bill-1",
          name: "子育て支援条例",
          bill_number: "第1号",
          sessionName: "令和8年第1回定例会",
          sessionStartDate: null,
          sessionEndDate: null,
        },
      ],
      "令和8年第1回定例会",
      undefined
    );

    expect(result[0].billId).toBe("bill-1");
  });

  describe("year and number matching", () => {
    const sessionBill = {
      number: "議第57号",
      name: "議事録の正式名称",
      description: null,
      result: null,
    };
    const publishedBill = {
      id: "detail-57",
      name: "わかりやすい別のタイトル",
      bill_number: "57",
      sessionName: "令和8年第2回定例会",
      sessionStartDate: "2026-06-12",
      sessionEndDate: "2026-06-26",
    };

    it("links by year and number despite differing titles, sessions, and dates", () => {
      const result = linkSessionBills(
        [sessionBill],
        [publishedBill],
        "令和8年第1回定例会",
        "2026-03-01"
      );
      expect(result[0].billId).toBe("detail-57");
    });

    it("supports full-width and year-prefixed bill numbers", () => {
      expect(
        linkSessionBills(
          [{ ...sessionBill, number: "議第５７号" }],
          [{ ...publishedBill, bill_number: "令和８年 議第５７号" }],
          "2026年 第1回定例会",
          undefined
        )[0].billId
      ).toBe("detail-57");
    });

    it("uses the meeting term when the title has no year", () => {
      expect(
        linkSessionBills(
          [sessionBill],
          [publishedBill],
          "本会議",
          undefined,
          undefined,
          [],
          "令和8年度"
        )[0].billId
      ).toBe("detail-57");
    });

    it("uses calendar year from dates when no year label is available", () => {
      expect(
        linkSessionBills(
          [sessionBill],
          [{ ...publishedBill, sessionName: null }],
          "本会議",
          "2026-03-01"
        )[0].billId
      ).toBe("detail-57");
    });

    it("rejects a different year even when both name and number match", () => {
      expect(
        linkSessionBills(
          [sessionBill],
          [{ ...publishedBill, name: sessionBill.name }],
          "令和7年第1回定例会",
          "2025-03-01"
        )[0].billId
      ).toBeNull();
    });

    it("does not link a different number or infer an unknown year", () => {
      expect(
        linkSessionBills(
          [sessionBill],
          [{ ...publishedBill, bill_number: "58" }],
          "令和8年",
          undefined
        )[0].billId
      ).toBeNull();
      expect(
        linkSessionBills([sessionBill], [publishedBill], "本会議", undefined)[0]
          .billId
      ).toBeNull();
    });

    it("does not confuse petition numbers with bill numbers", () => {
      expect(
        linkSessionBills(
          [sessionBill],
          [{ ...publishedBill, bill_number: "請願第57号" }],
          "令和8年",
          undefined
        )[0].billId
      ).toBeNull();
    });

    it("does not let a topic reference override the year/number match", () => {
      expect(
        linkSessionBills(
          [sessionBill],
          [publishedBill],
          "令和8年",
          undefined,
          1,
          [
            {
              sessionId: 1,
              billNumber: "57",
              billName: sessionBill.name,
              billId: "wrong-detail",
            },
          ]
        )[0].billId
      ).toBe("detail-57");
    });
  });

  it("does not link when a numbered bill does not match", () => {
    const result = linkSessionBills(
      [
        {
          number: "第2号",
          name: "子育て支援条例",
          description: null,
          result: null,
        },
      ],
      [
        {
          id: "bill-1",
          name: "子育て支援条例",
          bill_number: "第1号",
          sessionName: "令和8年第1回定例会",
          sessionStartDate: null,
          sessionEndDate: null,
        },
      ],
      "令和8年第1回定例会",
      undefined
    );

    expect(result[0].billId).toBeNull();
  });

  it("does not link ambiguous names without a matching bill number", () => {
    const result = linkSessionBills(
      [
        {
          number: null,
          name: "子育て支援条例",
          description: null,
          result: null,
        },
      ],
      [
        {
          id: "bill-1",
          name: "子育て支援条例",
          bill_number: "第1号",
          sessionName: "令和8年第1回定例会",
          sessionStartDate: null,
          sessionEndDate: null,
        },
        {
          id: "bill-2",
          name: "子育て支援条例",
          bill_number: "第2号",
          sessionName: "令和8年第2回定例会",
          sessionStartDate: null,
          sessionEndDate: null,
        },
      ],
      "",
      undefined
    );

    expect(result[0].billId).toBeNull();
  });

  it("does not choose between duplicate same-year numbers even when session names match", () => {
    const result = linkSessionBills(
      [
        {
          number: "議第57号",
          name: "条例の一部改正について",
          description: null,
          result: null,
        },
      ],
      [
        {
          id: "bill-57",
          name: "別表記の条例名",
          bill_number: "57",
          sessionName: "令和8年第2回定例会",
          sessionStartDate: null,
          sessionEndDate: null,
        },
        {
          id: "other-session-bill-57",
          name: "別表記の条例名",
          bill_number: "57",
          sessionName: "令和8年第1回定例会",
          sessionStartDate: null,
          sessionEndDate: null,
        },
      ],
      "令和8年第2回定例会",
      undefined
    );

    expect(result[0].billId).toBeNull();
  });

  it("does not resolve duplicate same-year numbers by meeting date alone", () => {
    const result = linkSessionBills(
      [
        {
          number: "議第57号",
          name: "条例の一部改正について",
          description: null,
          result: null,
        },
      ],
      [
        {
          id: "bill-57",
          name: "別表記の条例名",
          bill_number: "57",
          sessionName: "令和8年第2回定例会",
          sessionStartDate: "2026-06-12",
          sessionEndDate: "2026-06-26",
        },
        {
          id: "other-session-bill-57",
          name: "別表記の条例名",
          bill_number: "57",
          sessionName: "令和8年第1回定例会",
          sessionStartDate: "2026-03-01",
          sessionEndDate: "2026-03-31",
        },
      ],
      "令和8年",
      "2026-06-12"
    );

    expect(result[0].billId).toBeNull();
  });

  it("links a unique bill name when bill number formatting differs", () => {
    const result = linkSessionBills(
      [
        {
          number: "議第57号",
          name: "子育て支援条例",
          description: null,
          result: null,
        },
      ],
      [
        {
          id: "bill-57",
          name: "子育て支援条例",
          bill_number: "57号",
          sessionName: "令和8年第2回定例会",
          sessionStartDate: "2026-06-12",
          sessionEndDate: "2026-06-26",
        },
      ],
      "令和8年",
      "2026-06-12"
    );

    expect(result[0].billId).toBe("bill-57");
  });

  it("does not link an ambiguous bill name when the number does not match", () => {
    const result = linkSessionBills(
      [
        {
          number: "議第57号",
          name: "子育て支援条例",
          description: null,
          result: null,
        },
      ],
      [
        {
          id: "bill-1",
          name: "子育て支援条例",
          bill_number: "58号",
          sessionName: "令和8年第2回定例会",
          sessionStartDate: "2026-06-12",
          sessionEndDate: "2026-06-26",
        },
        {
          id: "bill-2",
          name: "子育て支援条例",
          bill_number: "59号",
          sessionName: "令和8年第1回定例会",
          sessionStartDate: "2026-03-01",
          sessionEndDate: "2026-03-31",
        },
      ],
      "令和8年",
      "2026-06-12"
    );

    expect(result[0].billId).toBeNull();
  });

  it("does not link a topic reference without verifying the target year and number", () => {
    const result = linkSessionBills(
      [
        {
          number: "議第57号",
          name: "大分市個人番号の利用及び特定個人情報の提供に関する条例の一部改正について",
          description: null,
          result: null,
        },
      ],
      [],
      "令和8年 第2回定例会",
      "2026-06-12",
      9,
      [
        {
          sessionId: 9,
          billNumber: "57",
          billName: null,
          billId: "published-topic-bill",
        },
        {
          sessionId: 10,
          billNumber: "議第57号",
          billName: null,
          billId: "other-session-bill",
        },
      ]
    );

    expect(result[0].billId).toBeNull();
  });
});
