import { describe, expect, it } from "vitest";
import { resolveTopicInterviewBillId } from "./resolve-topic-interview-bill-id";

describe("resolveTopicInterviewBillId", () => {
  const bills = [
    { id: "topic-1", name: "トピックA", source: "topic" },
    { id: "meeting-1", name: "議案B", source: "meeting" },
  ];

  it("interview_bill_id が設定されていればそれを優先する", () => {
    expect(resolveTopicInterviewBillId("explicit", "トピックA", bills)).toBe(
      "explicit"
    );
  });

  it("未設定ならタイトル一致のトピック受け皿を返す", () => {
    expect(resolveTopicInterviewBillId(null, "トピックA", bills)).toBe(
      "topic-1"
    );
  });

  it("タイトルが一致しても議案（meeting）には紐付けない", () => {
    expect(resolveTopicInterviewBillId(null, "議案B", bills)).toBeNull();
  });

  it("一致するものが無ければ null", () => {
    expect(resolveTopicInterviewBillId(undefined, "不明", bills)).toBeNull();
  });
});
