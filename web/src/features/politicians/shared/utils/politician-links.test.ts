import { describe, expect, it } from "vitest";
import {
  classifyPoliticianUrl,
  collectPoliticianLinks,
  parsePoliticianSnsLinks,
} from "./politician-links";

describe("classifyPoliticianUrl", () => {
  it("classifies SNS and blog URLs accurately even when stored in homepage", () => {
    expect(classifyPoliticianUrl("https://x.com/example")).toBe("x");
    expect(classifyPoliticianUrl("https://twitter.com/example")).toBe("x");
    expect(classifyPoliticianUrl("https://www.instagram.com/example/")).toBe(
      "instagram"
    );
    expect(classifyPoliticianUrl("https://www.facebook.com/example")).toBe(
      "facebook"
    );
    expect(classifyPoliticianUrl("https://www.youtube.com/@example")).toBe(
      "youtube"
    );
    expect(classifyPoliticianUrl("https://note.com/example")).toBe("note");
    expect(classifyPoliticianUrl("https://ameblo.jp/example/")).toBe("blog");
    expect(classifyPoliticianUrl("https://example-councilor.jp/")).toBe(
      "homepage"
    );
  });
});

describe("parsePoliticianSnsLinks", () => {
  it("extracts valid http/https URLs and ignores invalid schemes or unknown keys", () => {
    expect(
      parsePoliticianSnsLinks({
        x: "https://x.com/test",
        instagram: "javascript:alert(1)",
        youtube: "https://youtube.com/@test",
        unknown: "https://example.com",
      })
    ).toEqual({
      x: "https://x.com/test",
      youtube: "https://youtube.com/@test",
    });
  });

  it("returns empty object for non-object values", () => {
    expect(parsePoliticianSnsLinks(null)).toEqual({});
    expect(parsePoliticianSnsLinks([])).toEqual({});
    expect(parsePoliticianSnsLinks("invalid")).toEqual({});
  });
});

describe("collectPoliticianLinks", () => {
  it("reclassifies X URL in homepage and deduplicates matching sns_links", () => {
    const links = collectPoliticianLinks({
      homepage: "https://x.com/oita_councilor/",
      blog_url: "https://ameblo.jp/oita-councilor/",
      sns_links: {
        x: "https://x.com/oita_councilor",
        instagram: "https://www.instagram.com/oita_councilor/",
      },
    });

    expect(links.map((l) => l.platform)).toEqual(["blog", "x", "instagram"]);
    expect(links[1].label).toBe("X（旧Twitter）");
  });

  it("orders official HP first, followed by blog and SNS platforms", () => {
    const links = collectPoliticianLinks({
      homepage: "https://oita-councilor.jp",
      blog_url: "https://note.com/oita_councilor",
      sns_links: {
        youtube: "https://youtube.com/@oita",
        x: "https://x.com/oita",
      },
    });

    expect(links.map((l) => l.platform)).toEqual([
      "homepage",
      "note",
      "x",
      "youtube",
    ]);
  });
});
