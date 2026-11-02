import { describe, expect, it } from "vitest";
import { navigationGroups } from "../navigation";
import { isNavigationActive } from "./navigation";

describe("isNavigationActive", () => {
  it("既存の管理機能への導線を維持する", () => {
    const paths = navigationGroups.flatMap((group) =>
      group.links.map((link) => link.href)
    );
    for (const href of [
      "/bills",
      "/topics",
      "/topic-voices",
      "/information",
      "/council-sessions",
      "/tags",
      "/factions",
      "/committees",
      "/politicians",
      "/politician-speeches",
      "/ai-collection",
      "/admins",
    ]) {
      expect(paths).toContain(href);
    }
    expect(new Set(paths).size).toBe(paths.length);
  });
  it("一覧と詳細に一致する", () => {
    expect(isNavigationActive("/bills", "/bills")).toBe(true);
    expect(isNavigationActive("/bills/123/edit", "/bills")).toBe(true);
  });
  it("似た接頭辞には一致しない", () => {
    expect(isNavigationActive("/politician-speeches", "/politicians")).toBe(
      false
    );
    expect(isNavigationActive("/bills-other", "/bills")).toBe(false);
  });
  it("アーカイブも議事録の配下として表示する", () => {
    expect(isNavigationActive("/committee-meetings/123", "/minutes")).toBe(
      true
    );
  });
});
