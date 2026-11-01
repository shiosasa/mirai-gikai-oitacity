import { describe, expect, it } from "vitest";
import {
  buildPublishedSpeechHighlights,
  getSampleSpeechHighlights,
  parseSpeechPreviewSamples,
  sortSpeechHighlights,
} from "./speech-highlights";

describe("speech highlight samples", () => {
  const sample = {
    id: "sample-1",
    politician_id: "politician-1",
    politician_name: "見本議員",
    meeting_session_id: 1,
    meeting_id: 1,
    meeting_type: "委員会",
    meeting_title: "見本委員会",
    meeting_date: "2026-03-25",
    title: "質問の見本",
    quote: "内容について伺います。",
    context: "見本の補足です。",
    approved: false,
  };
  const samples = parseSpeechPreviewSamples(
    JSON.stringify([
      sample,
      { ...sample, id: "sample-2", meeting_date: "2026-06-24" },
      { ...sample, id: "sample-3", politician_id: "politician-2" },
    ])
  );

  it("selects only the requested politician's examples", () => {
    expect(getSampleSpeechHighlights("politician-1", samples)).toHaveLength(2);
    expect(getSampleSpeechHighlights("politician-2", samples)).toHaveLength(1);
    expect(getSampleSpeechHighlights("not-a-politician", samples)).toEqual([]);
  });

  it("rejects malformed, empty or invalid preview data", () => {
    expect(() => parseSpeechPreviewSamples(undefined)).toThrow(
      "POLITICIAN_SPEECH_PREVIEW_JSON"
    );
    expect(() => parseSpeechPreviewSamples("{")).toThrow();
    expect(() => parseSpeechPreviewSamples("[]")).toThrow();
    expect(() =>
      parseSpeechPreviewSamples(JSON.stringify([{ ...sample, quote: "" }]))
    ).toThrow();
    expect(() =>
      parseSpeechPreviewSamples(
        JSON.stringify([{ ...sample, meeting_type: "別の会議" }])
      )
    ).toThrow();
    expect(() =>
      parseSpeechPreviewSamples(JSON.stringify([sample, sample]))
    ).toThrow("見本のIDが重複しています");
  });

  describe("buildPublishedSpeechHighlights", () => {
    const row = {
      id: "speech-1",
      title: "質問の見本",
      quote: "内容について伺います。",
      context: "見本の補足です。",
      meeting_sessions: {
        id: 53,
        meeting_id: 9,
        date: "2026-03-25",
        content: "○見本委員\n　内容について伺います。",
        meetings: {
          id: 9,
          title: "見本委員会",
          meeting_type: "委員会",
        },
      },
    };

    it("builds the highlight from the original session and meeting", () => {
      const result = buildPublishedSpeechHighlights([row]);
      expect(result.invalidSources).toEqual([]);
      expect(result.highlights[0]).toMatchObject({
        id: "speech-1",
        context: row.context,
        meetingId: 9,
        sessionId: 53,
        meetingType: "委員会",
        meetingDate: "2026-03-25",
      });
    });

    it("reports missing, changed, ambiguous or mismatched sources without showing them", () => {
      const result = buildPublishedSpeechHighlights([
        row,
        { ...row, id: "missing", meeting_sessions: null },
        {
          ...row,
          id: "changed",
          meeting_sessions: {
            ...row.meeting_sessions,
            content: "別の発言です。",
          },
        },
        {
          ...row,
          id: "ambiguous",
          meeting_sessions: {
            ...row.meeting_sessions,
            content: `${row.quote}\n${row.quote}`,
          },
        },
        {
          ...row,
          id: "mismatched",
          meeting_sessions: {
            ...row.meeting_sessions,
            meetings: { ...row.meeting_sessions.meetings, id: 10 },
          },
        },
      ]);
      expect(result.highlights.map((item) => item.id)).toEqual(["speech-1"]);
      expect(result.invalidSources.map((item) => item.id)).toEqual([
        "missing",
        "changed",
        "ambiguous",
        "mismatched",
      ]);
    });
  });

  it("returns newest meetings first without mutating the input", () => {
    const items = getSampleSpeechHighlights("politician-1", samples);
    expect(items.map((item) => item.meetingDate)).toEqual([
      "2026-06-24",
      "2026-03-25",
    ]);
    const reversed = [...items].reverse();
    expect(sortSpeechHighlights(reversed)).toEqual(items);
    expect(reversed[0].meetingDate).toBe("2026-03-25");
  });
});
