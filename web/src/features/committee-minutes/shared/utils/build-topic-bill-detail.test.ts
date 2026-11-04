import { describe, expect, it } from "vitest";
import { buildBillPickupItems } from "./build-bill-pickup-items";
import { buildTopicBillDetail } from "./build-topic-bill-detail";

const item = buildBillPickupItems([
  {
    id: 1,
    title: "本会議",
    meetingType: "本会議",
    sessions: [
      {
        id: 1,
        bills: [
          {
            number: "議第1号",
            name: "令和8年度大分市一般会計予算（農林水産部所管分）",
            billId: "common-budget",
            description: "イノシシ対策",
          },
        ],
      },
    ],
  },
])[0];
const article = {
  id: "school-lunch",
  title: "【学校給食費無償化】家計を支援",
  source_refs: [
    {
      session_id: 30,
      meeting_id: 5,
      meeting_type: "委員会",
      meeting_title: "文教常任委員会",
      session_label: "文教常任委員会",
      date: "2026-03-23",
      bill_number: "議第1号",
      bill_name: "令和8年度大分市一般会計予算",
      evidence_quote: null,
      detail_bill_id: "common-budget",
      detail_topic_id: "school-lunch",
    },
  ],
  summary_line_1: "給食費を無償化します。",
  summary_line_2: "",
  summary_line_3: "",
  details: "詳しい給食費の説明",
  reason: "保護者の負担軽減",
  point_1: "小中学校が対象",
  point_2: "",
  point_3: "",
  target_audience: "児童生徒と保護者",
  category: "childcare_education" as const,
  updated_at: "2026-11-04",
};

describe("buildTopicBillDetail", () => {
  it("lists a source session only once even if the article quotes it repeatedly", () => {
    const detail = buildTopicBillDetail(item, {
      ...article,
      source_refs: [article.source_refs[0], article.source_refs[0]],
    });
    expect(detail.item.references).toHaveLength(1);
  });
  it("keeps the bill ID and shows only the selected topic's content and references", () => {
    const detail = buildTopicBillDetail(item, article);
    expect(detail.item.billId).toBe(item.billId);
    expect(detail.title).toBe("令和8年度大分市一般会計予算：学校給食費無償化");
    expect(detail.normal).toBe(article.summary_line_1);
    expect(detail.hard).toBe(article.details);
    expect(detail.rest).toContain(article.reason);
    expect(detail.rest).not.toContain("イノシシ");
    expect(detail.item.references.map((r) => r.sessionId)).toEqual([30]);
    expect(item.description).toBe("イノシシ対策");
  });

  it("rejects a topic not linked to the requested bill", () => {
    expect(() =>
      buildTopicBillDetail({ ...item, billId: "another-bill" }, article)
    ).toThrow("対応");
  });

  it("does not substitute another theme when detailed text is missing", () => {
    const detail = buildTopicBillDetail(item, { ...article, details: "" });
    expect(detail.hard).toBe("");
    expect(detail.normal).toBe(article.summary_line_1);
  });

  it("reports missing source text rather than rendering empty content", () => {
    expect(() =>
      buildTopicBillDetail(item, {
        ...article,
        summary_line_1: "",
        details: "",
      })
    ).toThrow("本文");
  });
});
