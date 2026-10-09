import { describe, expect, it } from "vitest";
import {
  parseBillContentEntries,
  parseBillContentUpdates,
} from "./parse-bill-content-entries";

describe("parseBillContentEntries", () => {
  it("本文と任意の出典URLを取り出し、不正な項目を除外する", () => {
    expect(
      parseBillContentEntries([
        { text: "期待される効果", source_url: "https://example.com/source" },
        { text: "懸念点" },
        { text: 42 },
        null,
      ])
    ).toEqual([
      { text: "期待される効果", sourceUrl: "https://example.com/source" },
      { text: "懸念点", sourceUrl: null },
    ]);
  });

  it("配列でない値は空配列にする", () => {
    expect(parseBillContentEntries(null)).toEqual([]);
  });
});

describe("parseBillContentUpdates", () => {
  it("日付・本文・出典を持つ更新だけを返す", () => {
    expect(
      parseBillContentUpdates([
        {
          date: "2026-06-01",
          text: "審議日程を更新",
          source_url: "https://example.com",
        },
        { date: "2026-06-02", text: 123 },
      ])
    ).toEqual([
      {
        date: "2026-06-01",
        text: "審議日程を更新",
        sourceUrl: "https://example.com",
      },
    ]);
  });
});
