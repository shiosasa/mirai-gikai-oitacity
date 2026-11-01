import { describe, expect, it } from "vitest";
import { validateSpeechQuote } from "./speech-quote";

describe("validateSpeechQuote", () => {
  const minutes = "○見本委員\n　議題について伺います。\n　確認はいつですか。\n○課長\n　事前です。";

  it("accepts a unique, continuous excerpt from one speech", () => {
    expect(
      validateSpeechQuote(
        minutes,
        "議題について伺います。\n　確認はいつですか。"
      )
    ).toBeNull();
    expect(
      validateSpeechQuote(
        minutes.replace(/\n/g, "\r\n"),
        "議題について伺います。\n　確認はいつですか。"
      )
    ).toBeNull();
  });

  it("rejects absent sources, empty excerpts and changed text", () => {
    expect(validateSpeechQuote(null, "発言")).not.toBeNull();
    expect(validateSpeechQuote(minutes, "  ")).not.toBeNull();
    expect(validateSpeechQuote(minutes, "別の発言です。")).not.toBeNull();
    expect(
      validateSpeechQuote(minutes, "議題について伺います。\n確認はいつですか。")
    ).not.toBeNull();
  });

  it("rejects speaker markers and quotes spanning multiple speakers", () => {
    expect(validateSpeechQuote(minutes, "○見本委員")).not.toBeNull();
    expect(
      validateSpeechQuote(minutes, "確認はいつですか。\n○課長\n　事前です。")
    ).not.toBeNull();
  });

  it("rejects text that occurs more than once", () => {
    expect(validateSpeechQuote("はい。\nはい。", "はい。")).not.toBeNull();
  });
});
