import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layouts/container";
import { DifficultySelector } from "@/features/bill-difficulty/client/components/difficulty-selector";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import { MinutesContent } from "@/features/committee-minutes/server/components/minutes-content";
import {
  AttendeesSection,
  BillsSection,
} from "@/features/committee-minutes/server/components/session-extras";
import { getAllMeetingsAndCommittees } from "@/features/committee-minutes/server/loaders/get-all-meetings";
import { formatJapaneseDate } from "@/features/committee-minutes/shared/utils/format-japanese-date";

export const metadata = {
  title: "本会議詳細 | みらいぎかいっち＠大分",
};

interface PlenarySessionDetailPageProps {
  params: Promise<{ id: string; sessionId: string }>;
}

export default async function PlenarySessionDetailPage({
  params,
}: PlenarySessionDetailPageProps) {
  const { id, sessionId } = await params;
  const [{ plenaryMeetings }, currentDifficulty] = await Promise.all([
    getAllMeetingsAndCommittees(),
    getDifficultyLevel(),
  ]);

  const meeting = plenaryMeetings.find((m) => m.id.toString() === id);
  const session = meeting?.sessions.find((s) => s.id.toString() === sessionId);

  if (!meeting || !session) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <p className="text-sm text-mirai-text-muted">
            セッションが見つかりません。
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-8">
        <Link
          href={`/committees/plenary`}
          className="text-sm text-primary-accent hover:text-primary font-medium mb-4 inline-block"
        >
          ← 戻る
        </Link>
        <h1 className="text-2xl font-bold text-mirai-text mb-2">本会議</h1>
        <div className="flex items-center gap-2 text-sm text-mirai-text-muted">
          <CalendarDays className="w-4 h-4" />
          {formatJapaneseDate(session.date || meeting.date)}
        </div>
      </div>

      <div className="space-y-6">
        {(session.summary ||
          (currentDifficulty === "hard" && session.detailed_summary)) && (
          <section className="bg-white rounded-lg p-6 border border-mirai-border">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h2 className="text-lg font-bold text-mirai-text">
                {currentDifficulty === "hard" && session.detailed_summary
                  ? "📋 詳しい要約"
                  : "📋 やさしい要約"}
              </h2>
              <DifficultySelector currentLevel={currentDifficulty} />
            </div>
            {currentDifficulty === "hard" && session.detailed_summary ? (
              <p className="text-mirai-text-secondary leading-relaxed whitespace-pre-wrap">
                {session.detailed_summary}
              </p>
            ) : (
              <>
                {session.summary && (
                  <p className="text-mirai-text-secondary leading-relaxed">
                    {session.summary}
                  </p>
                )}
                {currentDifficulty === "hard" &&
                  !session.detailed_summary &&
                  session.summary && (
                    <p className="mt-3 text-sm text-mirai-text-muted">
                      詳しい要約は準備中です。
                    </p>
                  )}
              </>
            )}
          </section>
        )}

        {session.decisions && (
          <section className="bg-white rounded-lg p-6 border border-mirai-border">
            <h2 className="text-lg font-bold text-mirai-text mb-3">
              ✅ 決定事項
            </h2>
            <div className="text-mirai-text-secondary whitespace-pre-wrap leading-relaxed">
              {session.decisions}
            </div>
          </section>
        )}

        {session.bills && session.bills.length > 0 && (
          <BillsSection bills={session.bills} />
        )}

        {session.attendees && (
          <AttendeesSection
            attendees={session.attendees}
            meetingType="本会議"
          />
        )}

        {session.content && (
          <section className="bg-white rounded-lg p-6 border border-mirai-border">
            <h2 className="text-lg font-bold text-mirai-text mb-3">
              📝 詳細議事録
            </h2>
            <MinutesContent content={session.content} />
          </section>
        )}
      </div>
    </Container>
  );
}
