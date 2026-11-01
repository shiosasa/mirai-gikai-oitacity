import { describe, expect, it } from "vitest";
import { calculateAge } from "./calculate-age";

describe("calculateAge", () => {
  it("calculates age from the stored Japanese date and era", () => {
    expect(
      calculateAge("1957年（昭和32年）6月5日", new Date("2026-11-01T00:00:00Z"))
    ).toBe(69);
    expect(
      calculateAge(
        "１９５７年（昭和３２年）６月５日",
        new Date("2026-11-01T00:00:00Z")
      )
    ).toBe(69);
  });

  it("calculates age from direct Japanese era dates", () => {
    const now = new Date("2026-11-01T00:00:00Z");
    expect(calculateAge("昭和30年6月5日", now)).toBe(71);
    expect(calculateAge("平成元年11月2日", now)).toBe(36);
    expect(calculateAge("令和元年5月1日", now)).toBe(7);
    expect(calculateAge("令和元年５月１日", now)).toBe(7);
  });

  it("rejects dates outside their Japanese era boundaries", () => {
    const now = new Date("2026-11-01T00:00:00Z");
    expect(calculateAge("昭和元年12月24日", now)).toBeNull();
    expect(calculateAge("平成31年5月1日", now)).toBeNull();
    expect(calculateAge("令和元年4月30日", now)).toBeNull();
  });

  it("updates at midnight in Japan on the birthday", () => {
    expect(calculateAge("1957-06-05", new Date("2026-06-04T14:59:59Z"))).toBe(
      68
    );
    expect(calculateAge("1957/06/05", new Date("2026-06-04T15:00:00Z"))).toBe(
      69
    );
  });

  it("handles leap days and rejects dates that do not exist", () => {
    expect(
      calculateAge("2000年2月29日", new Date("2025-03-01T00:00:00Z"))
    ).toBe(25);
    expect(
      calculateAge("1900年2月29日", new Date("2026-11-01T00:00:00Z"))
    ).toBeNull();
    expect(
      calculateAge("1957年13月5日", new Date("2026-11-01T00:00:00Z"))
    ).toBeNull();
    expect(
      calculateAge("1957年6月31日", new Date("2026-11-01T00:00:00Z"))
    ).toBeNull();
  });

  it("does not invent an age for incomplete or future birth dates", () => {
    const now = new Date("2026-11-01T00:00:00Z");
    expect(calculateAge(null, now)).toBeNull();
    expect(calculateAge("1957年6月", now)).toBeNull();
    expect(calculateAge("2027年1月1日", now)).toBeNull();
  });
});
