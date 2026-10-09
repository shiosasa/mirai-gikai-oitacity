import type { CouncilSession } from "../../shared/types";
import { getCouncilSessionStatus } from "../../shared/utils/get-council-session-status";
import { formatDateJST } from "@/lib/utils/date";

type CurrentCouncilSessionProps = {
  currentSession: CouncilSession | null;
  nextSession: CouncilSession | null;
};

export function CurrentCouncilSession({
  currentSession,
  nextSession,
}: CurrentCouncilSessionProps) {
  const status = getCouncilSessionStatus(currentSession, nextSession);
  const session = currentSession ?? nextSession;

  return (
    <section className="w-full bg-mirai-surface-warm px-6 py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <h2 className="text-lg font-bold text-mirai-text sm:text-xl">
            現在の大分市議会の活動ステータス
          </h2>
          <span
            role="status"
            className={`inline-flex items-center rounded-full px-5 py-1.5 text-sm font-bold ${
              status.kind === "active"
                ? "bg-oita-pink text-white"
                : "bg-mirai-border-muted text-mirai-text"
            }`}
          >
            {status.label}
          </span>
        </div>
        {session && (
          <div className="text-sm leading-[1.5] text-mirai-text-secondary sm:text-right">
            <div className="font-bold text-mirai-text">{session.name}</div>
            <div>
              {formatDateJST(session.start_date)}〜
              {session.end_date ? formatDateJST(session.end_date) : ""}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
