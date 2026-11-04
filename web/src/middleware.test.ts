import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import {
  isHtmlAcceptHeader,
  isValidDifficultyLevel,
  middleware,
} from "./middleware";

describe("page-scoped difficulty", () => {
  it.each([
    ["", "normal"],
    ["?difficulty=hard", "hard"],
    ["?difficulty=normal", "normal"],
    ["?difficulty=invalid", "normal"],
    ["?topic=another-theme", "normal"],
  ])("uses the current URL %s instead of a saved global preference", (query, expected) => {
    const request = new NextRequest(
      `https://example.com/committees/plenary/1/8${query}`,
      {
        headers: { cookie: "bill_difficulty_level=hard; other=value" },
      }
    );
    const response = middleware(request);
    expect(request.cookies.get("bill_difficulty_level")?.value).toBe(expected);
    expect(response.headers.get("x-middleware-request-cookie")).toContain(
      `bill_difficulty_level=${expected}`
    );
    expect(response.headers.get("x-middleware-request-cookie")).toContain(
      "other=value"
    );
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("does not carry a detailed page's setting to the next page or prefetch", () => {
    const detailed = new NextRequest(
      "https://example.com/bills/first?difficulty=hard"
    );
    middleware(detailed);
    const nextPage = new NextRequest("https://example.com/bills/second", {
      headers: {
        cookie: detailed.headers.get("cookie") ?? "",
        "next-router-prefetch": "1",
      },
    });
    middleware(nextPage);
    expect(nextPage.cookies.get("bill_difficulty_level")?.value).toBe("normal");
  });
});

describe("isValidDifficultyLevel", () => {
  it("should return true for 'normal'", () => {
    expect(isValidDifficultyLevel("normal")).toBe(true);
  });

  it("should return true for 'hard'", () => {
    expect(isValidDifficultyLevel("hard")).toBe(true);
  });

  it("should return false for invalid value", () => {
    expect(isValidDifficultyLevel("easy")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isValidDifficultyLevel("")).toBe(false);
  });

  it("should return false for null", () => {
    expect(isValidDifficultyLevel(null)).toBe(false);
  });
});

describe("isHtmlAcceptHeader", () => {
  it("should return true for text/html", () => {
    expect(isHtmlAcceptHeader("text/html")).toBe(true);
  });

  it("should return true for accept header with text/html among others", () => {
    expect(
      isHtmlAcceptHeader(
        "text/html,application/xhtml+xml,application/xml;q=0.9"
      )
    ).toBe(true);
  });

  it("should return false for application/json", () => {
    expect(isHtmlAcceptHeader("application/json")).toBe(false);
  });

  it("should return false for image/png", () => {
    expect(isHtmlAcceptHeader("image/png")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isHtmlAcceptHeader("")).toBe(false);
  });
});
