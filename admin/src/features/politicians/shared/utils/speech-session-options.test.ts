import { describe, expect, it } from "vitest";
import {
  buildSpeechSessionUrl,
  buildSpeechSessionOptions,
  formatSpeechSession,
} from "./speech-session-options";

describe("speech session options", () => {
  const row = {
    id: 28,
    meeting_id: 4,
    session_title: "第1日",
    date: "2026-06-24",
    meetings: { id: 4, title: "厚生常任委員会", meeting_type: "委員会" },
  };

  it("builds a readable option with the exact source ids", () => {
    const result = buildSpeechSessionOptions([row]);
    expect(result.invalidIds).toEqual([]);
    expect(result.sessions[0]).toMatchObject({
      id: 28,
      meetingId: 4,
      meetingType: "委員会",
    });
    expect(formatSpeechSession(result.sessions[0])).toBe(
      "厚生常任委員会（2026/06/24）・第1日"
    );
    expect(
      buildSpeechSessionUrl("https://example.com/", result.sessions[0])
    ).toBe("https://example.com/committees/committee/4/28");
  });

  it("reports missing and inconsistent session data", () => {
    const result = buildSpeechSessionOptions([
      row,
      { ...row, id: 29, date: null },
      { ...row, id: 30, meetings: { ...row.meetings, id: 5 } },
      { ...row, id: 31, meetings: null },
      {
        ...row,
        id: 32,
        meetings: { ...row.meetings, meeting_type: "その他" },
      },
    ]);
    expect(result.sessions).toHaveLength(1);
    expect(result.invalidIds).toEqual([29, 30, 31, 32]);
  });
});
