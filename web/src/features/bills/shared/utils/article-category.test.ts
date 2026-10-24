import { describe, expect, it } from "vitest";
import {
  categoryEnumFromBadge,
  filterArticlesByCategory,
  getCategoryLabel,
} from "./article-category";

describe("filterArticlesByCategory", () => {
  const articles = [
    { id: "1", category: "childcare_education" },
    { id: "2", category: "safety_disaster" },
    { id: "3", category: "community_living" },
  ];

  it("returns every article for the all-categories selection", () => {
    expect(filterArticlesByCategory(articles, "すべて")).toEqual(articles);
  });

  it("returns only articles in the selected category", () => {
    expect(filterArticlesByCategory(articles, "安心・安全・防災")).toEqual([
      { id: "2", category: "safety_disaster" },
    ]);
  });
});

describe("getCategoryLabel", () => {
  it("enumキーから日本語ラベルを取得できる", () => {
    expect(getCategoryLabel("childcare_education")).toBe("子育て・教育");
    expect(getCategoryLabel("safety_disaster")).toBe("安心・安全・防災");
    expect(getCategoryLabel("community_living")).toBe("まちづくり・暮らし");
    expect(getCategoryLabel("governance_election")).toBe("まちの仕組み・選挙");
  });

  it("すでに日本語の場合はそのまま返す", () => {
    expect(getCategoryLabel("子育て・教育")).toBe("子育て・教育");
    expect(getCategoryLabel("安心・安全・防災")).toBe("安心・安全・防災");
    expect(getCategoryLabel("まちづくり・暮らし")).toBe("まちづくり・暮らし");
    expect(getCategoryLabel("まちの仕組み・選挙")).toBe("まちの仕組み・選挙");
  });

  it("null または undefined の場合はデフォルトの '子育て・教育' を返す", () => {
    expect(getCategoryLabel(null)).toBe("子育て・教育");
    expect(getCategoryLabel(undefined)).toBe("子育て・教育");
  });

  it("未知の文字列の場合はそのまま返す", () => {
    expect(getCategoryLabel("その他")).toBe("その他");
  });
});

describe("categoryEnumFromBadge", () => {
  it("日本語バッジから enumキーに変換できる", () => {
    expect(categoryEnumFromBadge("子育て・教育")).toBe("childcare_education");
    expect(categoryEnumFromBadge("安心・安全・防災")).toBe("safety_disaster");
    expect(categoryEnumFromBadge("まちづくり・暮らし")).toBe(
      "community_living"
    );
    expect(categoryEnumFromBadge("まちの仕組み・選挙")).toBe(
      "governance_election"
    );
  });

  it("null または undefined の場合は 'childcare_education' を返す", () => {
    expect(categoryEnumFromBadge(null)).toBe("childcare_education");
    expect(categoryEnumFromBadge(undefined)).toBe("childcare_education");
  });

  it("未知のバッジ名の場合はそのまま返す", () => {
    expect(categoryEnumFromBadge("other_category")).toBe("other_category");
  });
});
