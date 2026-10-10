import { describe, expect, it } from "vitest";
import { selectBillContent } from "./select-bill-content";

describe("selectBillContent", () => {
  const normal = {
    difficulty_level: "normal" as const,
    content: "normal body",
  };
  const hard = { difficulty_level: "hard" as const, content: "hard body" };

  it("prefers the requested difficulty when present", () => {
    expect(selectBillContent([normal, hard], "hard")).toBe(hard);
    expect(selectBillContent([hard, normal], "normal")).toBe(normal);
  });

  it("keeps the approved normal body visible when hard is unavailable", () => {
    expect(selectBillContent([normal], "hard")).toBe(normal);
  });

  it("does not substitute a hard body for a missing normal body", () => {
    expect(selectBillContent([hard], "normal")).toBeNull();
    expect(selectBillContent([], "hard")).toBeNull();
  });
});
