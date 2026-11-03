import { describe, expect, it } from "vitest";
import {
  joinMarkdownSections,
  splitMarkdownSections,
} from "./markdown-sections";

describe("Markdown section editing", () => {
  it("uses unique heading keys that survive body edits and insertion of other headings", () => {
    const original = splitMarkdownSections("## 詳細\n本文\n## 詳細\n別の本文");
    const edited = splitMarkdownSections(
      "## 新しい見出し\n追加\n## 詳細\n変更\n## 詳細\n別の変更"
    );
    expect(new Set(original.map((section) => section.key)).size).toBe(3);
    expect(edited.slice(2).map((section) => section.key)).toEqual(
      original.slice(1).map((section) => section.key)
    );
  });
  it.each([
    "",
    "前置き\n",
    "## 取り組みの詳細\n本文\n\n## 理由\n理由",
    "## 詳細\r\n本文\r\n",
    "前置き\n## 詳細\n本文\n",
  ])("preserves unchanged source exactly", (content) => {
    expect(joinMarkdownSections(splitMarkdownSections(content))).toBe(content);
  });
  it("does not split headings inside fenced source examples", () => {
    const content = "## 詳細\n```md\n## 例\n```\n## 理由\n説明";
    expect(splitMarkdownSections(content)).toHaveLength(3);
    expect(joinMarkdownSections(splitMarkdownSections(content))).toBe(content);
  });
  it("maintains a heading boundary when an edited body has no final newline", () => {
    const sections = splitMarkdownSections("## 詳細\n旧本文\n## 理由\n理由");
    sections[1].body = "新本文";
    expect(joinMarkdownSections(sections)).toBe(
      "## 詳細\n新本文\n\n## 理由\n理由"
    );
  });
});
