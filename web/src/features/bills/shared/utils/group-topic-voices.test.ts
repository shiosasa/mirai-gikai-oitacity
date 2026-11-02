import { describe, expect, it } from "vitest";
import {
  type FeaturedVoiceRow,
  groupTopicVoicesByBillId,
} from "./group-topic-voices";

const row = (overrides: Partial<FeaturedVoiceRow>): FeaturedVoiceRow => ({
  id: "r1",
  billId: "b1",
  stance: "for",
  role: "daily_life_affected",
  roleTitle: "保護者",
  municipalityConnection: "resident",
  summary: "要約",
  featuredAt: "2026-11-01T00:00:00Z",
  ...overrides,
});

describe("groupTopicVoicesByBillId", () => {
  it("トピックごとに採用順でまとめ、立場ラベルを付ける", () => {
    const result = groupTopicVoicesByBillId([
      row({ id: "late", featuredAt: "2026-11-03T00:00:00Z" }),
      row({ id: "early", featuredAt: "2026-11-01T00:00:00Z" }),
      row({ id: "other", billId: "b2", role: null, roleTitle: null }),
    ]);

    expect(result.get("b1")?.map((v) => v.reportId)).toEqual(["early", "late"]);
    expect(result.get("b1")?.[0].municipalityConnectionLabel).toBe(
      "大分市在住"
    );
    expect(result.get("b1")?.[0].roleLabel).toBe("保護者");
    expect(result.get("b2")?.[0].roleLabel).toBeNull();
  });

  it("市とのつながりが不明な既存回答では市ラベルを付けない", () => {
    const result = groupTopicVoicesByBillId([
      row({ municipalityConnection: null }),
    ]);
    expect(result.get("b1")?.[0].municipalityConnectionLabel).toBeNull();
  });

  it("記事との関わりの短縮タイトルが空なら一般的な立場に戻す", () => {
    const result = groupTopicVoicesByBillId([row({ roleTitle: "" })]);
    expect(result.get("b1")?.[0].roleLabel).toBe("暮らしに影響");
  });

  it("要約が空の回答は除く", () => {
    const result = groupTopicVoicesByBillId([row({ summary: " " })]);
    expect(result.has("b1")).toBe(false);
  });

  it("上限件数を超えた分は掲載しない", () => {
    const rows = Array.from({ length: 4 }, (_, i) =>
      row({ id: `r${i}`, featuredAt: `2026-11-0${i + 1}T00:00:00Z` })
    );
    expect(
      groupTopicVoicesByBillId(rows, 3)
        .get("b1")
        ?.map((v) => v.reportId)
    ).toEqual(["r0", "r1", "r2"]);
  });
});
