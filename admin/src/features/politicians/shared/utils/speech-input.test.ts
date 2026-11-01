import { describe, expect, it } from "vitest";
import { speechInputSchema } from "./speech-input";

const draft = {
  politicianId: "00000000-0000-4000-8000-000000000001",
  sessionId: 28,
  title: " 見出し ",
  context: " 補足。\r\n　続き。 ",
  quote: " 発言。\r\n　続き。 ",
  isPublished: false,
  speakerConfirmed: false,
};

describe("speechInputSchema", () => {
  it("trims text, normalizes line endings and permits an unconfirmed draft", () => {
    const result = speechInputSchema.parse(draft);
    expect(result.title).toBe("見出し");
    expect(result.context).toBe("補足。\n　続き。");
    expect(result.quote).toBe("発言。\n　続き。");
  });

  it("allows an empty or omitted explanation", () => {
    expect(speechInputSchema.parse({ ...draft, context: " " }).context).toBe(
      ""
    );
    expect(
      speechInputSchema.parse({ ...draft, context: undefined }).context
    ).toBe("");
  });

  it("requires explicit speaker confirmation when publishing", () => {
    expect(
      speechInputSchema.safeParse({ ...draft, isPublished: true }).success
    ).toBe(false);
    expect(
      speechInputSchema.safeParse({
        ...draft,
        isPublished: true,
        speakerConfirmed: true,
      }).success
    ).toBe(true);
  });

  it("rejects missing data and invalid identifiers", () => {
    for (const change of [
      { politicianId: "invalid" },
      { id: "invalid" },
      { sessionId: 0 },
      { title: " " },
      { quote: " " },
    ]) {
      expect(speechInputSchema.safeParse({ ...draft, ...change }).success).toBe(
        false
      );
    }
  });
});
