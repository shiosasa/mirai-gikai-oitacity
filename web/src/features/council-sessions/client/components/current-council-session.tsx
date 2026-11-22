import { unstable_noStore } from "next/cache";
import type { HomepageContent } from "@mirai-gikai/shared/homepage/content";
import { resolveCouncilActivityStatus } from "@mirai-gikai/shared/homepage/session-status";
import { siteConfig } from "@/config/site.config";
import type { CouncilSession } from "../../shared/types";
import { getCouncilSessionStatus } from "../../shared/utils/get-council-session-status";
import { selectCouncilSchedule } from "../../shared/utils/select-council-schedule";

type CurrentCouncilSessionProps = {
  currentSession: CouncilSession | null;
  nextSession: CouncilSession | null;
  content?: HomepageContent;
};

export function CurrentCouncilSession({
  currentSession: databaseCurrentSession,
  nextSession: databaseNextSession,
  content,
}: CurrentCouncilSessionProps) {
  unstable_noStore();

  const status =
    content?.sessionStatusName || content?.sessionStatusCustomText
      ? resolveCouncilActivityStatus(content, new Date())
      : getCouncilSessionStatus(
          ...(() => {
            const { currentSession, nextSession } = selectCouncilSchedule(
              [
                ...siteConfig.councilSchedule,
                ...(databaseCurrentSession ? [databaseCurrentSession] : []),
                ...(databaseNextSession ? [databaseNextSession] : []),
              ],
              new Date()
            );
            return [currentSession, nextSession] as const;
          })()
        );

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
