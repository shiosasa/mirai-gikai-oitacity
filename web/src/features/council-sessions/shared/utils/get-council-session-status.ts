import { formatDateJST } from "@/lib/utils/date";
import type { CouncilSession } from "../types";

type SessionDateRange = Pick<CouncilSession, "start_date" | "end_date"> & {
  name?: string;
};

function formatSession(session: SessionDateRange): string {
  const format = session.name
    ? (date: string) => formatDateJST(date).slice(5)
    : formatMonthDay;
  return `${session.name ? `${session.name} ` : ""}${format(session.start_date)}〜${session.end_date ? format(session.end_date) : ""}`;
}

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
    return {
      kind: "active",
      label: `開会中（${formatSession(currentSession)}）`,
    };
  }

  return {
    kind: "closed",
    label: nextSession
      ? `閉会中（次回 ${formatSession(nextSession)}）`
      : "閉会中（次回定例会未定）",
  };
}
