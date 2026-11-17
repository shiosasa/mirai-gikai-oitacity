import { parsePoliticianBirthDate } from "@mirai-gikai/shared/politicians/birth-date";
import { formatDateJST } from "@/lib/utils/date";

export function calculateAge(
  birthDate: string | null,
  at: Date
): number | null {
  const parsed = parsePoliticianBirthDate(birthDate);
  if (!parsed) return null;
  const { year, month, day } = parsed;
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
