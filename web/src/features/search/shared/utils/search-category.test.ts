import { describe, expect, it } from "vitest";
import { ARTICLE_CATEGORIES } from "@/features/bills/shared/utils/article-category";
import {
  buildSearchUrl,
  filterSearchTopics,
  parseSearchCategory,
} from "./search-category";

describe("search categories", () => {
  it("uses exactly the five requested labels in order", () => {
    expect(ARTICLE_CATEGORIES).toEqual([
      "すべて",
      "子育て・教育",
      "安心・安全・防災",
      "まちづくり・暮らし",
      "まちの仕組み・選挙",
    ]);
  });

  describe("filterSearchTopics", () => {
    const topics = [
      {
        title: "給食の無償化",
        category: "childcare_education",
        summary_line_1: "支援",
      },
      {
        title: "通学路の安全",
        category: "safety_disaster",
        summary_line_1: "支援",
      },
      { title: "道路整備", category: "community_living", summary_line_1: null },
      { title: "選挙", category: "governance_election", summary_line_1: "" },
    ];

    it("filters by category without requiring a keyword", () => {
      for (const [index, category] of ARTICLE_CATEGORIES.slice(1).entries()) {
        expect(filterSearchTopics(topics, "", category)).toEqual([
          topics[index],
        ]);
      }
    });

    it("intersects keyword and category instead of searching the label", () => {
      expect(filterSearchTopics(topics, "支援", "子育て・教育")).toEqual([
        topics[0],
      ]);
      expect(filterSearchTopics(topics, "道路", "子育て・教育")).toEqual([]);
    });

    it("all removes only category filtering", () => {
      expect(filterSearchTopics(topics, "支援", "すべて")).toEqual(
        topics.slice(0, 2)
      );
      expect(filterSearchTopics(topics, "", "すべて")).toEqual(topics);
    });

    it("searches translated category labels and handles nullable text", () => {
      expect(filterSearchTopics(topics, "まちづくり", "すべて")).toEqual([
        topics[2],
      ]);
      expect(filterSearchTopics(topics, "存在しない", "すべて")).toEqual([]);
    });
  });

  it("defaults to all and accepts every category", () => {
    expect(parseSearchCategory(undefined)).toBe("すべて");
    for (const category of ARTICLE_CATEGORIES) {
      expect(parseSearchCategory(category)).toBe(category);
    }
  });

  it("reports unsupported categories", () => {
    expect(() => parseSearchCategory("不明")).toThrow("不明な検索カテゴリ");
  });

  it("supports category selection without a keyword", () => {
    const url = new URL(buildSearchUrl("", "子育て・教育"), "http://localhost");
    expect(url.searchParams.get("category")).toBe("子育て・教育");
    expect(url.searchParams.has("q")).toBe(false);
  });

  it("preserves keywords on category changes and clears only the category", () => {
    const url = new URL(
      buildSearchUrl(" 給食 & 教育 ", "子育て・教育"),
      "http://localhost"
    );
    expect(url.searchParams.get("q")).toBe("給食 & 教育");
    expect(url.searchParams.get("category")).toBe("子育て・教育");
    expect(buildSearchUrl("", "すべて")).toBe("/search");
    const all = new URL(buildSearchUrl("給食", "すべて"), "http://localhost");
    expect(all.searchParams.get("q")).toBe("給食");
    expect(all.searchParams.has("category")).toBe(false);
  });
});
