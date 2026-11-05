import { describe, expect, it } from "vitest";
import { buildSearchFilter } from "./search-filter";

describe("buildSearchFilter", () => {
  it("searches all specified columns with a trimmed keyword", () => {
    expect(buildSearchFilter(["title", "summary"], " 子ども ")).toBe(
      'title.ilike."%子ども%",summary.ilike."%子ども%"'
    );
  });

  it("quotes punctuation so it cannot change the filter structure", () => {
    expect(buildSearchFilter(["title"], '食事,予算(案)"')).toBe(
      'title.ilike."%食事,予算(案)\\"%"'
    );
  });

  it("treats SQL wildcard characters and backslashes as literal text", () => {
    expect(buildSearchFilter(["title"], "100%_\\")).toBe(
      `title.ilike.${JSON.stringify("%100\\%\\_\\\\%")}`
    );
  });
});
