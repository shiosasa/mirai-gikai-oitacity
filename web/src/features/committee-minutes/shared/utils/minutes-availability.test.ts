import { describe, expect, it } from "vitest";
import {
  hasMinutesContent,
  hasSessionDetails,
  isMeetingUpdating,
} from "./minutes-availability";

describe("hasMinutesContent", () => {
  it("treats missing or whitespace-only minutes as unavailable", () => {
    for (const content of [undefined, null, "", " \n　"]) {
      expect(hasMinutesContent(content)).toBe(false);
    }
    expect(hasMinutesContent("議事録の本文")).toBe(true);
  });
});

describe("isMeetingUpdating", () => {
  it("marks a meeting with no sessions or minutes as updating", () => {
    expect(isMeetingUpdating([])).toBe(true);
    expect(isMeetingUpdating([{ content: null }, { content: "  " }])).toBe(
      true
    );
  });

  it("does not mark the whole meeting as updating when any minutes exist", () => {
    expect(
      isMeetingUpdating([{ content: null }, { content: "議事録の本文" }])
    ).toBe(false);
  });
});

describe("hasSessionDetails", () => {
  it("does not link to a session with no displayable information", () => {
    expect(hasSessionDetails({})).toBe(false);
    expect(
      hasSessionDetails({
        content: " ",
        summary: "\n",
        detailed_summary: null,
        decisions: "",
        attendees: null,
        bills: [],
      })
    ).toBe(false);
  });

  it("preserves links when any detail is available", () => {
    expect(hasSessionDetails({ content: "議事録" })).toBe(true);
    expect(hasSessionDetails({ summary: "要約" })).toBe(true);
    expect(hasSessionDetails({ detailed_summary: "詳しい要約" })).toBe(true);
    expect(hasSessionDetails({ decisions: "決定事項" })).toBe(true);
    expect(hasSessionDetails({ attendees: {} })).toBe(true);
    expect(hasSessionDetails({ bills: [{}] })).toBe(true);
  });
});
