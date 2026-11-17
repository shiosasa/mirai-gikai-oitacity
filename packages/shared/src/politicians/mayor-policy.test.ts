import { describe, expect, it } from "vitest";
import { extractMayorPolicy } from "./mayor-policy";

describe("shared mayor policy preview", () => {
  it("uses the same five-pillar and motto recognition for admin and public views", () => {
    expect(
      extractMayorPolicy(
        "「確認用方針」を基本方針とし、「A」、「B」、「C」、「D」と「E」の５つの柱。"
      )
    ).toEqual({ motto: "確認用方針", pillars: ["A", "B", "C", "D", "E"] });
  });

  it("never invents pillars for unrelated or cleared biography text", () => {
    expect(extractMayorPolicy(null)).toEqual({ motto: null, pillars: [] });
    expect(extractMayorPolicy("経歴のみです。")).toEqual({ motto: null, pillars: [] });
  });
});
