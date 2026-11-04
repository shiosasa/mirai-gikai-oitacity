import { describe, expect, it } from "vitest";
import type { SpeechSessionContent } from "../types/speech";
import type { SpeechInput } from "./speech-input";
import { validateSpeechPublication } from "./speech-publication-validation";

const politicians = [
  { id: "00000000-0000-4000-8000-000000000001", name: "見本 太郎" },
  { id: "00000000-0000-4000-8000-000000000002", name: "架空 花子" },
];
const input: SpeechInput = {
  politicianId: politicians[0].id,
  sessionId: 28,
  title: "質問の見本",
  context: "見本の補足です。",
  quote: "内容について伺います。",
  isPublished: true,
  speakerConfirmed: true,
};
const session: SpeechSessionContent = {
  id: 28,
  meeting_id: 4,
  session_title: "第1日",
  date: "2026-06-24",
  content: "○見本委員\n　内容について伺います。",
  attendees: { members: ["見本太郎", "架空花子"] },
  meetings: { id: 4, title: "見本委員会", meeting_type: "委員会" },
};

describe("validateSpeechPublication", () => {
  it("accepts a confirmed quote from the selected speaker and source", () => {
    expect(validateSpeechPublication(input, session, politicians)).toBeNull();
  });

  it("rejects missing confirmation, sources and changed quotes", () => {
    expect(
      validateSpeechPublication(
        { ...input, speakerConfirmed: false },
        session,
        politicians
      )
    ).not.toBeNull();
    expect(validateSpeechPublication(input, null, politicians)).not.toBeNull();
    expect(
      validateSpeechPublication(
        { ...input, quote: "別の発言" },
        session,
        politicians
      )
    ).not.toBeNull();
  });

  it("rejects a confidently identified different politician", () => {
    expect(
      validateSpeechPublication(
        { ...input, politicianId: politicians[1].id },
        session,
        politicians
      )
    ).toContain("一致しません");
  });

  it("allows a manually confirmed quote if the speaker label cannot be identified", () => {
    expect(
      validateSpeechPublication(
        input,
        { ...session, attendees: null },
        politicians
      )
    ).toBeNull();
  });
});
