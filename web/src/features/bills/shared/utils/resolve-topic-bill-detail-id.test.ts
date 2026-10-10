import { describe, expect, it } from "vitest";
import { resolveTopicBillDetailId } from "./resolve-topic-bill-detail-id";

describe("resolveTopicBillDetailId", () => {
  it("uses a published detail page with an exact bill-name match", () => {
    const publishedBills = new Map([["条例案", "published-detail"]]);

    expect(
      resolveTopicBillDetailId(
        "条例案",
        "別の記事",
        "topic-detail",
        publishedBills
      )
    ).toBe("published-detail");
  });

  it("does not substitute a theme article for an uncreated bill detail", () => {
    expect(
      resolveTopicBillDetailId(
        "大分市学校給食費の管理に関する条例の一部改正について",
        "【小中学校給食費無償化事業】9年間の負担はゼロに",
        "lunch-topic-detail",
        new Map()
      )
    ).toBeNull();
  });

  it("does not link an unrelated referenced bill to the topic detail", () => {
    expect(
      resolveTopicBillDetailId(
        "令和8年度大分市一般会計予算",
        "【小中学校給食費無償化事業】9年間の負担はゼロに",
        "lunch-topic-detail",
        new Map()
      )
    ).toBeNull();
  });

  it("does not link when no matching published detail page exists", () => {
    expect(
      resolveTopicBillDetailId("未作成議案", "給食費無償化", null, new Map())
    ).toBeNull();
  });
});
