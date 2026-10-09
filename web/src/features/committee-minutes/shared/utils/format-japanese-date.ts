// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatJapaneseDate(isoDate: any): string {
  if (!isoDate || typeof isoDate !== "string") return "";

  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return isoDate;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const dateObj = new Date(year, month - 1, day);
  if (isNaN(dateObj.getTime())) return isoDate;

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const weekday = weekdays[dateObj.getDay()];

  return `${year}年${month}月${day}日（${weekday}）`;
}
