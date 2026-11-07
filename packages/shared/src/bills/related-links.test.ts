import { describe, expect, it } from "vitest";
import { getRelatedLinks } from "./related-links";

describe("getRelatedLinks", () => {
  it("preserves legacy links and their fallback labels", () => {
    expect(getRelatedLinks({ link_url: "https://example.com" })).toEqual([
      { label: "", url: "https://example.com" },
    ]);
    expect(getRelatedLinks({ related_links: null })).toEqual([]);
  });
  it("preserves array order and treats an empty array as deliberate removal", () => {
    const links = [
      { label: "資料", url: "https://example.com/2" },
      { label: "概要", url: "https://example.com/1" },
    ];
    expect(getRelatedLinks({ related_links: links })).toEqual(links);
    expect(
      getRelatedLinks({ related_links: [], link_url: "https://example.com" })
    ).toEqual([]);
  });
  it("does not hide malformed stored links", () => {
    expect(() => getRelatedLinks({ related_links: {} })).toThrow();
    expect(() => getRelatedLinks({ related_links: [{ url: 1 }] })).toThrow();
  });
});
