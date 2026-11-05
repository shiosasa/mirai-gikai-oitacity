import { describe, expect, it } from "vitest";
import { loadSearchPages } from "./load-search-pages";

describe("loadSearchPages", () => {
  it("retrieves every result beyond both 50 and the default API limit", async () => {
    const rows = Array.from({ length: 1205 }, (_, i) => i);
    const ranges: number[][] = [];
    const result = await loadSearchPages(async (from, to) => {
      ranges.push([from, to]);
      return rows.slice(from, to + 1);
    });
    expect(result).toEqual(rows);
    expect(ranges).toHaveLength(7);
    expect(ranges[6]).toEqual([1200, 1399]);
  });

  it("stops when there are no results", async () => {
    expect(await loadSearchPages(async () => [])).toEqual([]);
  });

  it("propagates failures rather than returning incomplete results", async () => {
    await expect(
      loadSearchPages(async () => {
        throw new Error("DB error");
      })
    ).rejects.toThrow("DB error");
  });
});
