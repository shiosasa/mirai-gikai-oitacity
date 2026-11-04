import { describe, expect, it } from "vitest";
import { getHttpUrl } from "./external-url";

describe("getHttpUrl", () => {
  it("accepts absolute HTTP and HTTPS URLs", () => {
    expect(getHttpUrl(" https://example.com/doc.pdf ")).toBe(
      "https://example.com/doc.pdf"
    );
    expect(getHttpUrl("http://example.com")).toBe("http://example.com/");
  });

  it.each([
    null,
    "",
    "/file.pdf",
    "javascript:alert(1)",
    "data:text/html,test",
    "https://user:password@example.com/",
    "not a url",
  ])("rejects an unsafe or invalid URL: %s", (value) => {
    expect(getHttpUrl(value)).toBeNull();
  });
});
