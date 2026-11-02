import { describe, expect, it } from "vitest";
import { getMunicipalityConnectionLabel } from "./municipality-connection";

describe("getMunicipalityConnectionLabel", () => {
  it.each([
    ["resident", "大分市在住"],
    ["connected", "大分市にゆかり"],
    ["other", "その他"],
  ] as const)("returns the label for %s", (connection, expected) => {
    expect(getMunicipalityConnectionLabel(connection)).toBe(expected);
  });

  it("returns null when the connection is unknown", () => {
    expect(getMunicipalityConnectionLabel(null)).toBeNull();
    expect(getMunicipalityConnectionLabel(undefined)).toBeNull();
  });
});
