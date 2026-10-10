import { unstable_noStore } from "next/cache";
import { siteConfig } from "@/config/site.config";
import type { CouncilSession } from "../../shared/types";
import { getCouncilSessionStatus } from "../../shared/utils/get-council-session-status";
import { selectCouncilSchedule } from "../../shared/utils/select-council-schedule";

type CurrentCouncilSessionProps = {
  currentSession: CouncilSession | null;
  nextSession: CouncilSession | null;
};

export function CurrentCouncilSession({
  currentSession: databaseCurrentSession,
  nextSession: databaseNextSession,
}: CurrentCouncilSessionProps) {
  unstable_noStore();
  const { currentSession, nextSession } = selectCouncilSchedule(
    [
      ...siteConfig.councilSchedule,
      ...(databaseCurrentSession ? [databaseCurrentSession] : []),
      ...(databaseNextSession ? [databaseNextSession] : []),
    ],
    new Date()
  );
  const status = getCouncilSessionStatus(currentSession, nextSession);

  return (
    <section className="w-full bg-mirai-surface-warm px-4 py-6 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold text-mirai-text sm:text-xl">
            現在の大分市議会の活動ステータス
          </h2>
          <span
            role="status"
            className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold text-mirai-text ${
              status.kind === "active"
                ? "border-oita-pink bg-oita-pink-accent"
                : "border-oita-pink-accent bg-oita-pink-light"
            }`}
          >
            {status.label}
          </span>
        </div>
      </div>
    </section>
  );
}
