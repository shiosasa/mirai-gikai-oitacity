import { describe, expect, it } from "vitest";
import { extractMarkdownSection } from "./extract-markdown-section";

const markdown = [
  "## 取り組みの詳細",
  "議案の説明です。",
  "",
  "2段落目です。",
  "",
  "## 背景・理由",
  "背景です。",
  "",
  "## 審議結果・出典",
  "- [本会議](/committees/plenary/1/8)",
].join("\n");

describe("extractMarkdownSection", () => {
  it("splits the section body from the rest of the markdown", () => {
    const { body, rest } = extractMarkdownSection(markdown, "取り組みの詳細");
    expect(body).toBe("議案の説明です。\n\n2段落目です。");
    expect(rest).toBe(
      "## 背景・理由\n背景です。\n\n## 審議結果・出典\n- [本会議](/committees/plenary/1/8)"
    );
  });

  it("handles the last section and CRLF line endings", () => {
    const { body, rest } = extractMarkdownSection(
      markdown.replace(/\n/g, "\r\n"),
      "審議結果・出典"
    );
    expect(body).toBe("- [本会議](/committees/plenary/1/8)");
    expect(rest.endsWith("背景です。")).toBe(true);
  });

  it("returns null body when the heading is missing or empty", () => {
    expect(extractMarkdownSection(markdown, "存在しない").body).toBeNull();
    expect(
      extractMarkdownSection("## 取り組みの詳細\n\n## 背景", "取り組みの詳細")
        .body
    ).toBeNull();
  });
});
