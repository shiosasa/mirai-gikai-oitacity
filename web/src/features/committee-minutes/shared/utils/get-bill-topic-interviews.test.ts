import { describe, expect, it } from "vitest";
import { getBillTopicInterviews } from "./get-bill-topic-interviews";

describe("getBillTopicInterviews", () => {
  const topic = {
    title: "Related topic",
    interview_bill_id: "topic-interview",
    source_refs: [{ detail_bill_id: "budget" }],
  };

  it("links the related topic interview, not the new bill without a config", () => {
    expect(getBillTopicInterviews("budget", [topic])).toEqual([
      { billId: "topic-interview", title: "Related topic" },
    ]);
  });

  it("excludes unrelated topics and topics without a public interview", () => {
    expect(getBillTopicInterviews("another-bill", [topic])).toEqual([]);
    expect(
      getBillTopicInterviews("budget", [
        { ...topic, interview_bill_id: null },
        { ...topic, source_refs: null },
      ])
    ).toEqual([]);
  });

  it("deduplicates repeated interview destinations", () => {
    expect(getBillTopicInterviews("budget", [topic, topic])).toHaveLength(1);
  });
});
