import { describe, expect, it } from "vitest";
import { identifySpeechSpeaker } from "./speech-speaker";

const politicians = [
  { id: "sample", name: "見本 太郎" },
  { id: "fiction", name: "架空 花子" },
];

describe("identifySpeechSpeaker", () => {
  it("identifies a plenary speaker by the full name in the label", () => {
    expect(
      identifySpeechSpeaker(
        "○17番（見本太郎）　確認をお願いします。",
        "確認をお願いします。",
        politicians,
        null
      )
    ).toEqual({ kind: "matched", id: "sample", label: "17番（見本太郎）" });
  });

  it("identifies a surname-only committee label with attendee confirmation", () => {
    expect(
      identifySpeechSpeaker(
        "○架空委員\n　内容をお願いします。",
        "内容をお願いします。",
        politicians,
        { members: ["架空 花子", "見本 太郎"] }
      )
    ).toEqual({ kind: "matched", id: "fiction", label: "架空委員" });
  });

  it("does not guess when attendance is missing or surnames collide", () => {
    const text = "○架空委員\n　内容をお願いします。";
    expect(identifySpeechSpeaker(text, "内容をお願いします。", politicians, null)).toEqual({
      kind: "unknown",
      label: "架空委員",
    });
    expect(
      identifySpeechSpeaker(
        text,
        "内容をお願いします。",
        [...politicians, { id: "other", name: "架空 別人" }],
        { members: ["架空 花子"] }
      ).kind
    ).toBe("unknown");
    expect(
      identifySpeechSpeaker(text, "内容をお願いします。", politicians, {
        absent: ["架空 花子"],
        officials: ["架空 花子"],
      }).kind
    ).toBe("unknown");
  });

  it("does not identify unknown, absent or repeated quotations", () => {
    expect(
      identifySpeechSpeaker("○課長\n　はい。", "はい。", politicians, null).kind
    ).toBe("unknown");
    expect(
      identifySpeechSpeaker("○架空委員\n　はい。", "いいえ。", politicians, null).kind
    ).toBe("unknown");
    expect(
      identifySpeechSpeaker("○架空委員\n　はい。\n　はい。", "はい。", politicians, null)
        .kind
    ).toBe("unknown");
  });
});
