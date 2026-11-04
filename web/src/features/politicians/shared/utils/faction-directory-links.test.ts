import { describe, expect, it } from "vitest";
import {
  getFactionDirectoryLink,
  getFactionDirectorySectionId,
} from "./faction-directory-links";

describe("getFactionDirectorySectionId", () => {
  it("generates stable ASCII identifiers from normalized faction names", () => {
    expect(getFactionDirectorySectionId(" 自由民主党　")).toBe(
      "faction-81ea-7531-6c11-4e3b-515a"
    );
    expect(getFactionDirectorySectionId("😀")).toBe("faction-d83d-de00");
    expect(getFactionDirectorySectionId("😁")).toBe("faction-d83d-de01");
  });

  it("keeps punctuation, spaces, and other distinct names separate", () => {
    const names = [
      "A B",
      "AB",
      "A・B",
      "A-B",
      "A_B",
      "地域政党おおいた。",
      "地域政党おおいた",
      "自由民主党",
      "自由 民主党",
      "😀",
      "😁",
    ];
    const ids = names.map(getFactionDirectorySectionId);

    expect(new Set(ids).size).toBe(names.length);
    for (const id of ids) {
      expect(id).toMatch(/^faction-[0-9a-f]+(?:-[0-9a-f]+)*$/);
    }
  });
});

describe("getFactionDirectoryLink", () => {
  it("links to a matching current faction after trimming whitespace", () => {
    expect(
      getFactionDirectoryLink(
        " 地域政党おおいた。　",
        new Set(["地域政党おおいた。"])
      )
    ).toEqual({
      href: `/politicians#${getFactionDirectorySectionId("地域政党おおいた。")}`,
      isCurrent: true,
    });
  });

  it("falls back to the councillors heading for an absent historical faction", () => {
    expect(
      getFactionDirectoryLink("以前の会派", new Set(["現在の会派"]))
    ).toEqual({
      href: "/politicians#councillors-directory-heading",
      isCurrent: false,
    });
  });
});
