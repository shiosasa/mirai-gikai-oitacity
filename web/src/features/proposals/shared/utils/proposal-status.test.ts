import { describe, expect, it } from "vitest";
import { getProposalStatusStyle } from "./proposal-status";

describe("getProposalStatusStyle", () => {
  it("approvedは緑系スタイルを返す", () => {
    const result = getProposalStatusStyle("approved");
    expect(result.textClass).toBe("text-jimu-up");
    expect(result.bgClass).toBe("bg-stance-for-bg");
    expect(result.borderClass).toBe("border-jimu-up/30");
  });

  it("rejectedは赤系スタイルを返す", () => {
    const result = getProposalStatusStyle("rejected");
    expect(result.textClass).toBe("text-stance-against");
    expect(result.bgClass).toBe("bg-stance-against-bg");
    expect(result.borderClass).toBe("border-stance-against/30");
  });

  it("未知のステータスはデフォルト（ピンク）を返す", () => {
    const result = getProposalStatusStyle("in_progress");
    expect(result.textClass).toBe("text-oita-pink");
    expect(result.bgClass).toBe("bg-oita-pink-light");
    expect(result.borderClass).toBe("border-oita-pink-accent");
  });
});
