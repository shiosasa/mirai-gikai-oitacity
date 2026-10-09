import { describe, expect, it } from "vitest";
import { formatMinutesContent } from "./format-minutes-content";

describe("formatMinutesContent", () => {
  it("行頭の字下げを除去し、発言者行を判定する", () => {
    const content =
      "○仲道委員長　\n　ただいまから総務常任委員会を開会いたします。";
    expect(formatMinutesContent(content)).toEqual([
      { isSpeaker: true, text: "○仲道委員長" },
      {
        isSpeaker: false,
        text: "ただいまから総務常任委員会を開会いたします。",
      },
    ]);
  });

  it("中央寄せ・桁揃えの連続全角スペースを1つに圧縮する", () => {
    const content =
      "　　　　　　　　会議の概要\n　　１番　　　　大　津　將　嘉";
    expect(formatMinutesContent(content)).toEqual([
      { isSpeaker: false, text: "会議の概要" },
      { isSpeaker: false, text: "１番　大　津　將　嘉" },
    ]);
  });

  it("連続する空行を1行にまとめ、先頭の空行は除去する", () => {
    const content = "\n\n１．開催日時\n\n\n２．場所";
    expect(formatMinutesContent(content)).toEqual([
      { isSpeaker: false, text: "１．開催日時" },
      { isSpeaker: false, text: "" },
      { isSpeaker: false, text: "２．場所" },
    ]);
  });
});
