import { describe, expect, it } from "vitest";
import { informationInputSchema } from "./information-input";

describe("informationInputSchema", () => {
  const input = {
    title: " 新着のお知らせ ",
    body: " 内容 ",
    publishedAt: "2026-10-10T10:00:00+09:00",
    isPublished: false,
  };
  it("trims text and accepts draft and published notices", () => {
    expect(informationInputSchema.parse(input).title).toBe("新着のお知らせ");
    expect(informationInputSchema.parse(input).body).toBe("内容");
    expect(
      informationInputSchema.parse({ ...input, isPublished: true }).isPublished
    ).toBe(true);
  });
  it("rejects empty titles, invalid dates and invalid ids", () => {
    for (const change of [
      { title: " " },
      { publishedAt: "invalid" },
      { id: "invalid" },
    ]) {
      expect(
        informationInputSchema.safeParse({ ...input, ...change }).success
      ).toBe(false);
    }
  });
});
