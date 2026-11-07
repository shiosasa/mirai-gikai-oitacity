import { describe, expect, it } from "vitest";
import { addTopicBudgetDetailLinks } from "./add-topic-budget-detail-links";

const source = {
  session_id: 30,
  meeting_id: 5,
  meeting_type: "委員会",
  meeting_title: "文教常任委員会",
  session_label: "文教常任委員会",
  date: "2026-03-23",
  bill_number: "議第１号",
  bill_name: "令和8年度大分市一般会計予算",
  evidence_quote: null,
};
const bill = {
  id: "common-budget",
  name: "令和8年度大分市一般会計予算（農林水産部所管分）",
  bill_number: "令和8年 議第1号",
  publish_status: "published",
  source: "meeting",
};

describe("topic-specific links with a shared budget ID", () => {
  it("preserves one bill ID while selecting each article's own theme", () => {
    const articles = [
      { id: "school-lunch", source_refs: [source] },
      { id: "mental-health", source_refs: [source] },
    ];
    const result = addTopicBudgetDetailLinks(articles, [bill]);
    expect(result.map((a) => a.source_refs?.[0])).toEqual([
      { ...source, detail_bill_id: bill.id, detail_topic_id: "school-lunch" },
      { ...source, detail_bill_id: bill.id, detail_topic_id: "mental-health" },
    ]);
    expect(articles[0].source_refs[0]).toEqual(source);
  });

  it.each([
    { ...bill, source: "topic" },
    { ...bill, publish_status: "draft" },
    { ...bill, name: "令和7年度大分市一般会計予算" },
    { ...bill, bill_number: "令和8年 議第2号" },
    { ...bill, name: "令和8年度大分市一般会計補正予算（第1号）" },
  ])("does not link an incompatible candidate: %j", (candidate) => {
    const [article] = addTopicBudgetDetailLinks(
      [{ id: "school-lunch", source_refs: [source] }],
      [candidate]
    );
    expect(article.source_refs[0]).toMatchObject({
      detail_bill_id: null,
      detail_topic_id: null,
    });
  });

  it("does not guess between duplicate budget candidates", () => {
    const [article] = addTopicBudgetDetailLinks(
      [{ id: "school-lunch", source_refs: [source] }],
      [bill, { ...bill, id: "duplicate" }]
    );
    expect(article.source_refs[0]).toMatchObject({ detail_bill_id: null });
  });

  it("preserves the regular law link without attaching a budget theme", () => {
    const lawSource = {
      ...source,
      bill_name: "学校給食費条例",
      bill_number: "議第35号",
      detail_bill_id: "law-35",
    };
    const [article] = addTopicBudgetDetailLinks(
      [{ id: "school-lunch", source_refs: [lawSource] }],
      [bill]
    );
    expect(article.source_refs[0]).toEqual(lawSource);
  });
});
