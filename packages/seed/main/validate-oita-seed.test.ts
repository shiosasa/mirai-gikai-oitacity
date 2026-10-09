import { describe, expect, it } from "vitest";
import { validateOitaSeed } from "./validate-oita-seed";

const validSeed = {
  councilSessions: [
    {
      name: "令和8年第3回大分市議会定例会",
      council_url:
        "https://www.city.oita.oita.jp/shigikai/honkaigi/index.html",
    },
  ],
  bills: [
    {
      name: "市議会提出議案",
      source_url:
        "https://www.city.oita.oita.jp/shigikai/honkaigi/yotegian/index.html",
    },
  ],
  tags: [
    { label: "子育て・教育" },
    { label: "安心・安全・防災" },
    { label: "まちづくり・暮らし" },
    { label: "まちの仕組み・選挙" },
  ],
};

describe("validateOitaSeed", () => {
  it("公式URLと必要カテゴリのある大分seedを受け入れる", () => {
    expect(() => validateOitaSeed(validSeed)).not.toThrow();
  });

  it("福岡など別地域の議案があれば拒否する", () => {
    expect(() =>
      validateOitaSeed({
        ...validSeed,
        bills: [{ name: "福岡県の議案", source_url: null }],
      })
    ).toThrow(/別地域の議案/);
  });

  it("公式出典がない議案を拒否する", () => {
    expect(() =>
      validateOitaSeed({
        ...validSeed,
        bills: [{ name: "大分市の議案", source_url: null }],
      })
    ).toThrow(/公式出典URL/);
  });
});