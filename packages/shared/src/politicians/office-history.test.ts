import { describe, expect, it } from "vitest";
import {
  belongsToMayor,
  formatOfficeTerm,
  type OfficeTerm,
} from "./office-history";

const old: OfficeTerm = {
  id: 1,
  role: "mayor",
  mayor_id: 1,
  politician_id: null,
  started_on: "2023-04-23",
  ended_on: "2027-04-22",
  term_number: 1,
  seat_number: null,
  faction: null,
  standing_committee: null,
  special_committee: null,
  source_url: null,
  ended_source_url: null,
};
const next: OfficeTerm = {
  ...old,
  id: 2,
  mayor_id: 2,
  started_on: "2027-04-23",
  ended_on: null,
};
describe("mayor office attribution", () => {
  it("keeps retirement day with the former mayor and appointment day with the successor", () => {
    expect(belongsToMayor("2027-04-22", 1, [old, next])).toBe(true);
    expect(belongsToMayor("2027-04-22", 2, [old, next])).toBe(false);
    expect(belongsToMayor("2027-04-23", 2, [old, next])).toBe(true);
  });
  it("never guesses unknown or ambiguous dates", () => {
    expect(belongsToMayor(null, 1, [old])).toBe(false);
    expect(belongsToMayor("2022-01-01", 1, [old])).toBe(false);
    expect(
      belongsToMayor("2024-01-01", 1, [{ ...old, started_on: null }])
    ).toBe(false);
    expect(
      belongsToMayor("2024-01-01", 1, [
        old,
        { ...next, started_on: "2023-01-01" },
      ])
    ).toBe(false);
  });
  it("retains multiple terms for a returning person", () => {
    const returning = {
      ...old,
      id: 3,
      started_on: "2031-04-23",
      ended_on: null,
      term_number: 2,
    };
    const closedNext = { ...next, ended_on: "2031-04-22" };
    expect(belongsToMayor("2032-01-01", 1, [old, closedNext, returning])).toBe(
      true
    );
    expect(belongsToMayor("2029-01-01", 1, [old, closedNext, returning])).toBe(
      false
    );
    expect(formatOfficeTerm({ ...old, started_on: null })).toContain(
      "就任日未確認"
    );
  });
});
