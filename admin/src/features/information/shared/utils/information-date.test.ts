import { describe, expect, it } from "vitest";
import {
  resolveInformationPublishedAt,
  toInputDateValue,
} from "./information-date";

describe("information-date utils", () => {
  describe("toInputDateValue", () => {
    it("converts ISO date to YYYY-MM-DD in JST", () => {
      expect(toInputDateValue("2026-10-10T01:00:00Z")).toBe("2026-10-10");
      // JST 2026-10-11 01:00 (UTC 2026-10-10 16:00)
      expect(toInputDateValue("2026-10-10T16:00:00Z")).toBe("2026-10-11");
    });

    it("returns empty string for null, undefined or invalid dates", () => {
      expect(toInputDateValue(null)).toBe("");
      expect(toInputDateValue(undefined)).toBe("");
      expect(toInputDateValue("invalid-date")).toBe("");
    });
  });

  describe("resolveInformationPublishedAt", () => {
    const fixedNow = new Date("2026-11-08T12:00:00Z");

    it("uses input date with JST offset when provided", () => {
      const result = resolveInformationPublishedAt(
        "2026-10-10",
        null,
        fixedNow
      );
      expect(result).toBe("2026-10-10T00:00:00+09:00");
    });

    it("falls back to existing published_at when input date is empty", () => {
      const existing = "2026-09-01T15:30:00+09:00";
      expect(resolveInformationPublishedAt("", existing, fixedNow)).toBe(
        existing
      );
      expect(resolveInformationPublishedAt(null, existing, fixedNow)).toBe(
        existing
      );
      expect(resolveInformationPublishedAt("   ", existing, fixedNow)).toBe(
        existing
      );
    });

    it("falls back to now when both input date and existing are empty", () => {
      expect(resolveInformationPublishedAt("", null, fixedNow)).toBe(
        fixedNow.toISOString()
      );
      expect(resolveInformationPublishedAt(null, undefined, fixedNow)).toBe(
        fixedNow.toISOString()
      );
    });
  });
});
