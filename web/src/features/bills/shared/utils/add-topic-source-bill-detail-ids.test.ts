import { describe, expect, it } from "vitest";
import { addTopicSourceBillDetailIds } from "./add-topic-source-bill-detail-ids";

describe("addTopicSourceBillDetailIds", () => {
  it("links a source reference to the matching bill from that session", () => {
    const articles = [
      {
        source_refs: [
          {
            session_id: 10,
            meeting_id: 1,
            meeting_type: "本会議",
            meeting_title: "令和8年第1回定例会",
            session_label: "本会議",
            date: "2026-03-05",
            bill_number: "議第１号",
            bill_name: "令和8年度大分市一般会計予算",
            evidence_quote: null,
          },
        ],
      },
    ];

    expect(
      addTopicSourceBillDetailIds(articles, [
        {
          sessionId: 10,
          billNumber: "議第1号",
          billName: "令和8年度大分市一般会計予算",
          billId: "bill-1",
        },
        {
          sessionId: 11,
          billNumber: "議第1号",
          billName: "別の会議の議案",
          billId: "other-session-bill",
        },
      ])[0].source_refs?.[0].detail_bill_id
    ).toBe("bill-1");
  });

  it("does not attach a bill when the session reference is ambiguous", () => {
    const articles = [
      {
        source_refs: [
          {
            session_id: 10,
            meeting_id: 1,
            meeting_type: "本会議",
            meeting_title: "令和8年第1回定例会",
            session_label: "本会議",
            date: "2026-03-05",
            bill_number: "議第1号",
            bill_name: "令和8年度大分市一般会計予算",
            evidence_quote: null,
          },
        ],
      },
    ];

    expect(
      addTopicSourceBillDetailIds(articles, [
        {
          sessionId: 10,
          billNumber: "議第1号",
          billName: "令和8年度大分市一般会計予算",
          billId: "bill-1",
        },
        {
          sessionId: 10,
          billNumber: "議第1号",
          billName: "令和8年度大分市一般会計予算",
          billId: "bill-2",
        },
      ])[0].source_refs?.[0].detail_bill_id
    ).toBeNull();
  });

  it("falls back to an exact bill name when a number is missing", () => {
    const articles = [
      {
        source_refs: [
          {
            session_id: 10,
            meeting_id: 1,
            meeting_type: "本会議",
            meeting_title: "令和8年第1回定例会",
            session_label: "本会議",
            date: "2026-03-05",
            bill_number: null,
            bill_name: "学校給食費条例",
            evidence_quote: null,
          },
        ],
      },
    ];

    expect(
      addTopicSourceBillDetailIds(articles, [
        {
          sessionId: 10,
          billNumber: "議第35号",
          billName: "学校給食費条例",
          billId: "bill-35",
        },
      ])[0].source_refs?.[0].detail_bill_id
    ).toBe("bill-35");
  });
});
