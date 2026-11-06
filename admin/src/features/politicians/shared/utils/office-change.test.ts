import { describe, expect, it } from "vitest";
import { officeChangeSchema } from "./office-change";

const input = {
  role: "mayor",
  personId: "1",
  action: "replace",
  expectedTerm: 1,
  startedOn: "2026-04-02",
  endedOn: "2026-04-01",
  successorId: "2",
  seatNumber: null,
  termNumber: 1,
  sourceUrl: "https://www.city.oita.oita.jp/",
};
describe("office changes", () => {
  it("allows confirming only a current term's missing start date", () => {
    expect(
      officeChangeSchema.safeParse({
        ...input,
        action: "confirm-start",
        endedOn: null,
        successorId: null,
        seatNumber: null,
        termNumber: null,
      }).success
    ).toBe(true);
    expect(
      officeChangeSchema.safeParse({
        ...input,
        action: "confirm-start",
        expectedTerm: null,
      }).success
    ).toBe(false);
    expect(
      officeChangeSchema.safeParse({
        ...input,
        action: "confirm-start",
        startedOn: null,
      }).success
    ).toBe(false);
  });
  it("accepts a confirmed replacement without changing person identity", () => {
    expect(officeChangeSchema.parse(input)).toEqual(input);
  });
  it.each([
    { successorId: "1" },
    { successorId: null },
    { startedOn: "2026-04-01" },
    { endedOn: "2026-02-30" },
    { sourceUrl: "javascript:alert(1)" },
    { expectedTerm: null },
    { personId: "1.5" },
    { termNumber: 0 },
    { role: "councillor", personId: "1" },
  ])("rejects invalid changes %j", (patch) => {
    expect(officeChangeSchema.safeParse({ ...input, ...patch }).success).toBe(
      false
    );
  });
  it("supports retirement without inventing a successor or another term", () => {
    expect(
      officeChangeSchema.safeParse({
        ...input,
        action: "retire",
        successorId: null,
        startedOn: null,
        termNumber: null,
      }).success
    ).toBe(true);
  });
  it("supports returning people and re-election, but prevents reappointing an active term", () => {
    expect(
      officeChangeSchema.safeParse({
        ...input,
        action: "begin",
        expectedTerm: null,
        endedOn: null,
      }).success
    ).toBe(true);
    expect(
      officeChangeSchema.safeParse({
        ...input,
        action: "renew",
        successorId: null,
      }).success
    ).toBe(true);
    expect(
      officeChangeSchema.safeParse({ ...input, action: "begin" }).success
    ).toBe(false);
  });
});
