import { formatDateJST } from "@/lib/utils/date";

export function calculateAge(
  birthDate: string | null,
  at: Date
): number | null {
  if (!birthDate) return null;

  const normalized = birthDate
    .normalize("NFKC")
    .replace(/\s/g, "")
    .replace(/\((?:明治|大正|昭和|平成|令和)(?:元|\d+)年\)/g, "");
  const match =
    /^(\d{4})年(\d{1,2})月(\d{1,2})日$/.exec(normalized) ??
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(normalized);

  if (!match) return null;

  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  if (
    year < 1 ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  const [currentYear, currentMonth, currentDay] = formatDateJST(
    at.toISOString()
  )
    .split("/")
    .map(Number);
  const birthdayPassed =
    currentMonth > month || (currentMonth === month && currentDay >= day);
  const age = currentYear - year - (birthdayPassed ? 0 : 1);
  return age >= 0 ? age : null;
}
