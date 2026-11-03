import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import {
  cardReferenceFilter,
  findCardReferences,
  updateCardReference,
} from "./card-reference";

const billId = "00000000-0000-4000-8000-000000000001";
const input = {
  billId,
  sessionId: 1,
  index: 0,
  name: "編集した議案",
  number: "第1号",
  description: "編集した説明",
};
const original = [
  {
    billId,
    name: "元の議案",
    number: null,
    description: "元の説明",
    result: "可決",
    unknown: { retained: true },
  },
  { billId: "other", name: "別の議案" },
];

describe("card references", () => {
  it("sends JSON containment rather than a PostgreSQL array literal through the actual SDK", async () => {
    let requestedUrl = "";
    const db = createClient("https://example.supabase.co", "test-key", {
      global: {
        fetch: async (url) => {
          requestedUrl = String(url);
          return new Response("[]", {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        },
      },
    });
    const { error } = await db
      .from("meeting_sessions")
      .select("id")
      .contains("bills", cardReferenceFilter(billId));
    expect(error).toBeNull();
    const filter = new URL(requestedUrl).searchParams.get("bills");
    expect(filter).toBe(`cs.[{"billId":"${billId}"}]`);
    if (!filter) throw new Error("Missing containment filter");
    expect(JSON.parse(filter.slice(3))).toEqual([{ billId }]);
  });
  it("rejects invalid bill identifiers before constructing the filter", () => {
    expect(() => cardReferenceFilter("invalid")).toThrow();
  });
  it("lists only the linked bill without losing the original array index", () => {
    expect(findCardReferences(original, billId)).toEqual([
      { index: 0, name: "元の議案", number: "", description: "元の説明" },
    ]);
  });
  it("preserves other bills, results and unknown fields", () => {
    const updated = updateCardReference(original, input);
    expect(updated[0]).toEqual({
      ...original[0],
      name: input.name,
      number: input.number,
      description: input.description,
    });
    expect(updated[1]).toEqual(original[1]);
    expect(original[0].name).toBe("元の議案");
  });
  it("can explicitly clear description and number", () => {
    expect(
      updateCardReference(original, {
        ...input,
        description: "",
        number: "",
      })[0]
    ).toMatchObject({ description: null, number: null });
  });
  it("rejects a changed index or a different bill", () => {
    expect(() => updateCardReference(original, { ...input, index: 1 })).toThrow(
      "再読み込み"
    );
    expect(() => updateCardReference(null, input)).toThrow("データ形式");
  });
  it("rejects malformed descriptions instead of erasing them", () => {
    expect(() =>
      findCardReferences(
        [{ billId, name: "議案", description: { invalid: true } }],
        billId
      )
    ).toThrow("データ形式");
  });
});
