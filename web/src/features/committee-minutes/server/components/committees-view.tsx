import "server-only";
import { ChevronRight, Landmark } from "lucide-react";
import Link from "next/link";
import type { MeetingArchive } from "../repositories/meeting-repository";

type Props = {
  plenaryMeetings: MeetingArchive[];
  allCommitteeMeetings: MeetingArchive[];
  billPickupCount: number;
};

export function CommitteesView({
  plenaryMeetings,
  allCommitteeMeetings,
  billPickupCount,
}: Props) {
  // 委員会を一意な名前でグループ化
  const uniqueCommittees = Array.from(
    new Map(allCommitteeMeetings.map((m) => [m.title, m]))
  ).map(([_, meeting]) => meeting);

  // 委員会を種別でソート：常任委員会 → 特別委員会
  const sortedCommittees = uniqueCommittees.sort((a, b) => {
    const aIsStanding = a.title.includes("常任");
    const bIsStanding = b.title.includes("常任");

    // 常任委員会を先に（true > false）
    if (aIsStanding !== bIsStanding) {
      return aIsStanding ? -1 : 1;
    }

    // 同じ種別なら名前順
    return a.title.localeCompare(b.title, "ja");
  });

  const hasContent = plenaryMeetings.length > 0 || sortedCommittees.length > 0;

  return (
    <div className="flex flex-col gap-10">
      <header className="rounded-2xl bg-gradient-to-br from-mirai-gradient-start to-mirai-gradient-end px-6 py-6 flex flex-col gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-accent bg-white/70 rounded-full px-3 py-1 w-fit">
          <Landmark className="w-3.5 h-3.5" />
          本会議・委員会アーカイブ
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-mirai-text leading-snug">
          本会議・委員会で話し合われたこと
        </h1>
        <p className="text-sm text-mirai-text-secondary leading-relaxed">
          大分市議会には、議案の最終決定を行う「本会議」と、テーマごとにくわしく議論する「委員会」があります。
          それぞれでどんな議題が話し合われたのかを、会議ごとに記録して残していきます。
        </p>
      </header>

      {!hasContent && (
        <p className="text-sm text-mirai-text-muted">
          本会議・委員会の記録は準備中です。
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/committees/bill-pickups">
          <div className="flex h-full items-center justify-between gap-2 rounded-2xl border border-mirai-border bg-white p-6 transition-all duration-200 hover:border-primary/50 hover:shadow-md">
            <div>
              <div className="mb-2 text-xs text-mirai-text-muted">
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  議案一覧
                </span>
              </div>
              <div className="text-lg font-bold text-mirai-text">
                議案ピックアップ
              </div>
              <div className="mt-1 text-xs text-mirai-text-muted">
                {billPickupCount}件の議案
              </div>
            </div>
            <ChevronRight className="w-5 h-5 shrink-0 text-primary-accent" />
          </div>
        </Link>

        {/* 本会議への入り口 */}
        {plenaryMeetings.length > 0 && (
          <Link href={`/committees/plenary`}>
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-mirai-border bg-white p-6 hover:border-primary/50 hover:shadow-md transition-all duration-200 h-full">
              <div>
                <div className="text-xs text-mirai-text-muted mb-2">
                  <span className="text-xs text-white bg-red-500 rounded-full px-2 py-0.5 font-medium">
                    本会議
                  </span>
                </div>
                <div className="font-bold text-mirai-text text-lg">本会議</div>
                <div className="mt-1 text-xs text-mirai-text-muted">
                  {plenaryMeetings.length}件の開催記録
                </div>
              </div>
              <ChevronRight className="w-5 h-5 shrink-0 text-primary-accent" />
            </div>
          </Link>
        )}

        {/* 各委員会への入り口（常任→特別の順） */}
        {sortedCommittees.map((meeting) => (
          <Link key={meeting.id} href={`/committees/committee/${meeting.id}`}>
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-mirai-border bg-white p-6 hover:border-primary/50 hover:shadow-md transition-all duration-200 h-full">
              <div>
                <div className="text-xs text-mirai-text-muted mb-2">
                  <span className="text-xs text-primary-accent bg-mirai-gradient-end rounded-full px-2 py-0.5 font-medium">
                    委員会
                  </span>
                </div>
                <div className="font-bold text-mirai-text text-lg">
                  {meeting.title}
                </div>
                <div className="mt-1 text-xs text-mirai-text-muted">
                  {meeting.sessions.length}件の開催記録
                </div>
              </div>
              <ChevronRight className="w-5 h-5 shrink-0 text-primary-accent" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
