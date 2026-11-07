import { describe, expect, it } from "vitest";
import {
  homepageDefaults,
  homepageGuide,
  homepageKeys,
  isHomepageUrl,
  parseHomepageContent,
  parseHomepageRevision,
} from "./content";

describe("homepage content", () => {
  it("accepts every existing field and preserves the initial content", () => {
    expect(parseHomepageContent(homepageDefaults)).toEqual(homepageDefaults);
    expect(homepageKeys).toHaveLength(45);
  });
  it("trims input and preserves intentional body line breaks", () => {
    expect(
      parseHomepageContent({ ...homepageDefaults, aboutHeadline: " a\nb " })
        .aboutHeadline
    ).toBe("a\nb");
  });
  it.each([
    null,
    [],
    {},
    { ...homepageDefaults, extra: "x" },
    { ...homepageDefaults, heroTitle: 1 },
    { ...homepageDefaults, heroTitle: "" },
    { ...homepageDefaults, heroTitle: "x".repeat(201) },
    { ...homepageDefaults, cityDescription: "x".repeat(5001) },
  ])("rejects incomplete or malformed values", (input) => {
    expect(() => parseHomepageContent(input)).toThrow();
  });
  it.each([
    "javascript:alert(1)",
    "//evil.example",
    "/\\evil.example",
    "https://user:pass@example.com",
    "http://example.com",
    "https:example.com",
    "https:///example.com",
    "/a\nb",
    "data:image/svg+xml,test",
  ])("rejects unsafe URLs: %s", (url) => {
    expect(isHomepageUrl(url)).toBe(false);
    expect(() =>
      parseHomepageContent({ ...homepageDefaults, topicsUrl: url })
    ).toThrow();
  });
  it.each([
    "/topics",
    "/sessions/a/questions?x=1#top",
    "https://example.com/image.png",
  ])("accepts safe URLs: %s", (url) => {
    expect(isHomepageUrl(url)).toBe(true);
  });
  it("keeps the automatic latest question link unless explicitly overridden", () => {
    expect(homepageGuide(homepageDefaults, "questions", "r8").url).toBe(
      "/sessions/r8/questions"
    );
    expect(
      homepageGuide(
        { ...homepageDefaults, questionsUrl: "/committees" },
        "questions",
        "r8"
      ).url
    ).toBe("/committees");
    expect(homepageGuide(homepageDefaults, "questions").url).toBe("");
  });
  it("validates optimistic concurrency revisions", () => {
    expect(parseHomepageRevision(0)).toBe(0);
    expect(parseHomepageRevision(2)).toBe(2);
    for (const value of [-1, 0.1, "1", null, Infinity])
      expect(() => parseHomepageRevision(value)).toThrow();
  });
});
