import { describe, expect, it } from "vitest";
import { toMeetingSearchResult } from "./meeting-search-result";

describe("toMeetingSearchResult", () => {
  const session = {
    id: 28,
    session_title: "開催日の議題",
    date: "2026-06-24",
    summary: "要約",
    meetings: { id: 4, title: "厚生常任委員会", meeting_type: "委員会" },
  };

  it("links committee results to the current session archive", () => {
    expect(toMeetingSearchResult(session)).toEqual({
      id: "28",
      committeeName: "厚生常任委員会",
      href: "/committees/committee/4/28",
      title: "開催日の議題",
      summary: "要約",
      meetingDate: "2026-06-24",
      matchedTopics: [],
    });
  });

  it("links plenary results to the plenary archive", () => {
    expect(
      toMeetingSearchResult({
        ...session,
        meetings: { id: 2, title: "定例会", meeting_type: "本会議" },
      }).href
    ).toBe("/committees/plenary/2/28");
  });

  it("uses the parent meeting title when the session title is missing", () => {
    expect(
      toMeetingSearchResult({ ...session, session_title: null }).title
    ).toBe("厚生常任委員会");
  });
});
