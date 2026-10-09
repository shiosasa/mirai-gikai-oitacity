import type { CouncilSession } from "../types";

type SessionDateRange = Pick<CouncilSession, "start_date" | "end_date">;

function formatMonthDay(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00+09:00`);
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function getCouncilSessionStatus(
  currentSession: SessionDateRange | null,
  nextSession: SessionDateRange | null
): { kind: "active" | "closed"; label: string } {
  if (currentSession) {
    const start = formatMonthDay(currentSession.start_date);
    const end = currentSession.end_date
      ? formatMonthDay(currentSession.end_date)
      : "";
    return {
      kind: "active",
      label: `🌸 会期中（${start}〜${end}）`,
    };
  }

  return {
    kind: "closed",
    label: nextSession
      ? `閉会中（次回 ${formatMonthDay(nextSession.start_date)}〜）`
      : "閉会中（次回定例会未定）",
  };
}
