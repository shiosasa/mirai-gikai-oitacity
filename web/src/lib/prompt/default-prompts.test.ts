import { describe, expect, it } from "vitest";
import { getDefaultPrompt, renderPromptTemplate } from "./default-prompts";

describe("renderPromptTemplate", () => {
  it("変数プレースホルダーが正しく置換される", () => {
    const template = "Hello {{ name }}, welcome to {{city}}!";
    const result = renderPromptTemplate(template, {
      name: "田中",
      city: "大分市",
    });
    expect(result).toBe("Hello 田中, welcome to 大分市!");
  });

  it("変数が未指定の場合は空文字で置換される", () => {
    const template = "タイトル: {{billTitle}} - 内容: {{billContent}}";
    const result = renderPromptTemplate(template, { billTitle: "新議案" });
    expect(result).toBe("タイトル: 新議案 - 内容: ");
  });

  it("variablesがundefinedの場合はテンプレートをそのまま返す", () => {
    const template = "固定テキスト";
    expect(renderPromptTemplate(template)).toBe("固定テキスト");
  });
});

describe("getDefaultPrompt", () => {
  it("top-chat-system のデフォルトプロンプトが取得できる", () => {
    const prompt = getDefaultPrompt("top-chat-system", {
      billSummary: "議案1、議案2",
    });
    expect(prompt.content).toContain("みらいぎかいっち＠大分市");
    expect(prompt.content).toContain("議案1、議案2");
    expect(JSON.parse(prompt.metadata)).toEqual({
      source: "fallback-default",
      promptName: "top-chat-system",
    });
  });

  it("bill-chat-system-normal のデフォルトプロンプトが取得できる", () => {
    const prompt = getDefaultPrompt("bill-chat-system-normal", {
      billName: "第1号議案",
      billTitle: "大分市予算案",
      billSummary: "概要テキスト",
      billContent: "詳細テキスト",
    });
    expect(prompt.content).toContain("第1号議案");
    expect(prompt.content).toContain("大分市予算案");
  });

  it("未知のプロンプト名の場合は標準の議案プロンプトにフォールバックする", () => {
    const prompt = getDefaultPrompt("unknown-prompt");
    expect(prompt.content).toContain("みらいぎかいっち＠大分市");
  });
});
