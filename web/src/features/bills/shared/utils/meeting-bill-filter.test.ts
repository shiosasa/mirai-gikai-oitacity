import { describe, expect, it } from "vitest";
import {
  applyMeetingBillFilter,
  buildPostgrestInList,
  deriveBillSource,
} from "./meeting-bill-filter";

type Call = { method: "eq" | "not"; args: string[] };

function createRecordingQuery() {
  const calls: Call[] = [];
  const query = {
    calls,
    eq(column: string, value: string) {
      calls.push({ method: "eq", args: [column, value] });
      return query;
    },
    not(column: string, operator: string, value: string) {
      calls.push({ method: "not", args: [column, operator, value] });
      return query;
    },
  };
  return query;
}

describe("buildPostgrestInList", () => {
  it("quotes every value so commas and parentheses are safe", () => {
    expect(buildPostgrestInList(["a,b", "（仮称）条例(案)"])).toBe(
      '("a,b","（仮称）条例(案)")'
    );
  });

  it("escapes double quotes and backslashes", () => {
    expect(buildPostgrestInList(['say "hi"', "a\\b"])).toBe(
      '("say \\"hi\\"","a\\\\b")'
    );
  });
});

describe("applyMeetingBillFilter", () => {
  it("filters by the source column when it exists", () => {
    const query = createRecordingQuery();
    applyMeetingBillFilter(query, { kind: "source" });
    expect(query.calls).toEqual([
      { method: "eq", args: ["source", "meeting"] },
    ]);
  });

  it("excludes topic anchors by name when the column is missing", () => {
    const query = createRecordingQuery();
    applyMeetingBillFilter(
      query,
      { kind: "excludeNames", topicTitles: ["【空き家】活用"] },
      "bills."
    );
    expect(query.calls).toEqual([
      { method: "not", args: ["bills.name", "in", '("【空き家】活用")'] },
    ]);
  });

  it("does nothing when there are no topic titles", () => {
    const query = createRecordingQuery();
    applyMeetingBillFilter(query, { kind: "excludeNames", topicTitles: [] });
    expect(query.calls).toEqual([]);
  });
});

describe("deriveBillSource", () => {
  it("treats bills named after a proposal as topic anchors", () => {
    const titles = new Set(["【空き家】活用"]);
    expect(deriveBillSource("【空き家】活用", titles)).toBe("topic");
    expect(deriveBillSource("市有財産の処分について", titles)).toBe("meeting");
  });
});
