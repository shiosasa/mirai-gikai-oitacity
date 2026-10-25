import { describe, expect, it } from "vitest";
import { sortTopicsByPublicationDate } from "./sort-topics-by-publication-date";

describe("sortTopicsByPublicationDate", () => {
  it("orders by publication date, not creation or decision dates", () => {
    const articles = [
      { id: 1, published_date: "2026-10-01", created_at: "2026-10-10" },
      { id: 2, published_date: "2026-10-08", created_at: "2026-10-01" },
      { id: 3, published_date: "2026-10-05", created_at: "2026-10-09" },
    ];
    expect(sortTopicsByPublicationDate(articles).map((a) => a.id)).toEqual([
      2, 3, 1,
    ]);
    expect(articles.map((a) => a.id)).toEqual([1, 2, 3]);
  });

  it("puts missing dates last without inventing a date", () => {
    const articles = [
      { id: 1, published_date: null },
      { id: 2, published_date: "2026-10-08" },
      { id: 3, published_date: null },
    ];
    expect(sortTopicsByPublicationDate(articles).map((a) => a.id)).toEqual([
      2, 1, 3,
    ]);
  });

  it("preserves order on equal dates and handles empty lists", () => {
    const articles = [
      { id: 1, published_date: "2026-10-08" },
      { id: 2, published_date: "2026-10-08" },
    ];
    expect(sortTopicsByPublicationDate(articles)).toEqual(articles);
    expect(sortTopicsByPublicationDate([])).toEqual([]);
  });

  it("reports malformed dates", () => {
    expect(() =>
      sortTopicsByPublicationDate([{ published_date: "invalid" }])
    ).toThrow("不正なサイト公開日");
  });
});
