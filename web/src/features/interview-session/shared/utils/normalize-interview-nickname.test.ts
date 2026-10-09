import { describe, expect, it } from "vitest";
import { normalizeInterviewNickname } from "./normalize-interview-nickname";

describe("normalizeInterviewNickname", () => {
  it("空白だけならnullを返す", () => {
    expect(normalizeInterviewNickname("  \n ")).toBeNull();
  });

  it("前後の空白を除き、24文字までにする", () => {
    expect(normalizeInterviewNickname("  おおいたっ子  ")).toBe("おおいたっ子");
    expect(normalizeInterviewNickname("あ".repeat(26))).toBe("あ".repeat(24));
  });
});
