import { describe, expect, it } from "vitest";
import { parsePoliticianBirthDate } from "./birth-date";

describe("parsePoliticianBirthDate", () => {
  it.each([
    ["1975-04-01", { year: 1975, month: 4, day: 1 }],
    ["1975/4/1", { year: 1975, month: 4, day: 1 }],
    ["昭和50年4月1日", { year: 1975, month: 4, day: 1 }],
    ["１９５７年（昭和３２年）６月５日", { year: 1957, month: 6, day: 5 }],
    ["平成元年1月8日", { year: 1989, month: 1, day: 8 }],
    ["2000年2月29日", { year: 2000, month: 2, day: 29 }],
  ])("parses %s using the public age rules", (value, expected) => {
    expect(parsePoliticianBirthDate(value)).toEqual(expected);
  });

  it.each([null, "", "1975年4月", "1900-02-29", "平成31年5月1日", "不明"])(
    "rejects incomplete or impossible dates: %s",
    (value) => {
      expect(parsePoliticianBirthDate(value)).toBeNull();
    }
  );
});
