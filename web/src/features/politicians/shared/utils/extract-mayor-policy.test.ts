import { describe, expect, it } from "vitest";
import { extractMayorPolicy } from "./extract-mayor-policy";

describe("extractMayorPolicy", () => {
  it("extracts the motto and five pillars from the stored biography", () => {
    const bio =
      "足立市長は「ひとが真ん中。」を基本方針とし、「ひとを守る」「ひとを育む」「ひとを支える」「ひとを豊かに」「ひとを元気に」の5つをまちづくりの柱として掲げています。";

    expect(extractMayorPolicy(bio)).toEqual({
      motto: "ひとが真ん中。",
      pillars: [
        "ひとを守る",
        "ひとを育む",
        "ひとを支える",
        "ひとを豊かに",
        "ひとを元気に",
      ],
    });
  });

  it("does not label unrelated or incomplete quotes as pillars", () => {
    expect(
      extractMayorPolicy("「A」「B」「C」「D」の4つを柱としています。")
    ).toEqual({ motto: null, pillars: [] });
    expect(extractMayorPolicy(null)).toEqual({ motto: null, pillars: [] });
  });

  it("handles Japanese separators and a full-width number", () => {
    expect(
      extractMayorPolicy("「A」、「B」、「C」、「D」と「E」の５つの柱。")
        .pillars
    ).toEqual(["A", "B", "C", "D", "E"]);
  });
});
