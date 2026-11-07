import { describe, expect, it } from "vitest";
import { buildDifficultyUrl } from "./build-difficulty-url";

describe("buildDifficultyUrl", () => {
  it("selects detailed text only in the current page URL", () => {
    expect(
      buildDifficultyUrl("https://example.com/committees/plenary/1/8", "hard")
    ).toBe("https://example.com/committees/plenary/1/8?difficulty=hard");
  });

  it("keeps theme, preview token, other parameters and fragment", () => {
    const result = new URL(
      buildDifficultyUrl(
        "https://example.com/preview/bills/1?topic=lunch&token=test#details",
        "hard"
      )
    );
    expect(result.pathname).toBe("/preview/bills/1");
    expect(result.searchParams.get("topic")).toBe("lunch");
    expect(result.searchParams.get("token")).toBe("test");
    expect(result.searchParams.get("difficulty")).toBe("hard");
    expect(result.hash).toBe("#details");
  });

  it("returns to the easy default without removing the selected theme", () => {
    expect(
      buildDifficultyUrl(
        "https://example.com/bill/1?topic=lunch&difficulty=hard#details",
        "normal"
      )
    ).toBe("https://example.com/bill/1?topic=lunch#details");
  });

  it("replaces duplicate difficulty values", () => {
    const url = new URL(
      buildDifficultyUrl(
        "https://example.com/bill/1?difficulty=normal&difficulty=hard",
        "hard"
      )
    );
    expect(url.searchParams.getAll("difficulty")).toEqual(["hard"]);
  });
});
