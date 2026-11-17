import { describe, expect, it } from "vitest";
import {
  selectTopicSource,
  type TopicSourceOption,
  topicSourcesSchema,
  validateTopicSources,
} from "./topic-sources";

const option: TopicSourceOption = {
  sessionId: 3,
  meetingId: 1,
  meetingType: "委員会",
  meetingTitle: "文教委員会",
  sessionLabel: "開催日",
  date: "2026-11-05",
  bills: [{ name: "学校の条例", number: "第1号" }],
};

describe("topic source selection", () => {
  it("builds both session-only and bill-specific references without manual IDs", () => {
    expect(selectTopicSource(option)).toMatchObject({
      session_id: 3,
      meeting_id: 1,
      bill_name: null,
      bill_number: null,
    });
    expect(selectTopicSource(option, 0)).toMatchObject({
      bill_name: "学校の条例",
      bill_number: "第1号",
    });
    expect(() => selectTopicSource(option, 2)).toThrow("議案");
  });
  it("refreshes display metadata while preserving evidence and extra stored fields", () => {
    const source = topicSourcesSchema.parse([
      {
        ...selectTopicSource(option, 0),
        meeting_title: "古い会議名",
        evidence_quote: "原文",
        extra: { preserved: true },
      },
    ]);
    expect(validateTopicSources(source, [option])[0]).toMatchObject({
      meeting_title: option.meetingTitle,
      evidence_quote: "原文",
      extra: { preserved: true },
    });
  });
  it("rejects deleted sessions, mismatched parents, and changed bills", () => {
    const source = selectTopicSource(option, 0);
    expect(() => validateTopicSources([source], [])).toThrow("議事録");
    expect(() =>
      validateTopicSources([{ ...source, meeting_id: 2 }], [option])
    ).toThrow("議事録");
    expect(() =>
      validateTopicSources([source], [{ ...option, bills: [] }])
    ).toThrow("議案");
  });
  it("allows explicit removal but rejects malformed stored references", () => {
    expect(validateTopicSources([], [option])).toEqual([]);
    expect(topicSourcesSchema.safeParse([{ session_id: "3" }]).success).toBe(
      false
    );
  });
  it("treats legacy empty bill fields as a session-only source", () => {
    const sources = topicSourcesSchema.parse([
      {
        ...selectTopicSource(option),
        bill_name: "",
        bill_number: "",
      },
    ]);
    expect(validateTopicSources(sources, [option])).toEqual([
      selectTopicSource(option),
    ]);
  });
});
