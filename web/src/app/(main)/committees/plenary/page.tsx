import { CalendarDays, ChevronDown } from "lucide-react";
import { formatJapaneseDate } from "@/features/committee-minutes/shared/utils/format-japanese-date";
import { getAllMeetingsAndCommittees } from "@/features/committee-minutes/server/loaders/get-all-meetings";
import { Container } from "@/components/layouts/container";
import Link from "next/link";

export const metadata = {
  title: "本会議 | みらいぎかいっち＠大分",
};

export default async function PlenaryPage() {
  const { plenaryMeetings } = await getAllMeetingsAndCommittees();

  if (plenaryMeetings.length === 0) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <p className="text-sm text-mirai-text-muted">
            本会議の記録は準備中です。
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-8">
        <Link
          href="/committees"
          className="text-sm text-primary-accent hover:text-primary font-medium mb-4 inline-block"
        >
          ← 戻る
        </Link>
        <h1 className="text-2xl font-bold text-mirai-text">本会議</h1>
      </div>

      <div className="space-y-8">
        {plenaryMeetings.map((meeting) => (
          <section key={meeting.id}>
            <h2 className="text-lg font-bold text-mirai-text mb-3">
              {meeting.title}
            </h2>
            <div className="space-y-3">
              {meeting.sessions.map((session) => (
                <details
                  key={session.id}
                  className="group border border-mirai-border rounded-lg bg-white hover:border-primary/50 transition-all"
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer select-none">
                    <div className="flex items-center gap-3">
                      <ChevronDown className="w-5 h-5 text-mirai-text-muted group-open:rotate-180 transition-transform" />
                      <div>
                        <div className="flex items-center gap-2 text-xs text-mirai-text-muted mb-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {formatJapaneseDate(session.date || meeting.date)}
                        </div>
                        <h3 className="font-bold text-mirai-text">
                          {session.session_title || meeting.title}
                        </h3>
                      </div>
                    </div>
                  </summary>

                  <div className="px-5 pb-5 border-t border-mirai-border pt-4 space-y-4">
                    {session.summary && (
                      <div>
                        <h4 className="text-sm font-semibold text-mirai-text mb-2">
                          📋 要約
                        </h4>
                        <p className="text-sm text-mirai-text-secondary">
                          {session.summary}
                        </p>
                      </div>
                    )}

                    {session.decisions && (
                      <div>
                        <h4 className="text-sm font-semibold text-mirai-text mb-2">
                          ✅ 決定事項
                        </h4>
                        <p className="text-sm text-mirai-text-secondary whitespace-pre-wrap">
                          {session.decisions}
                        </p>
                      </div>
                    )}

                    <Link
                      href={`/committees/plenary/${meeting.id}/${session.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary-accent hover:text-primary"
                    >
                      詳細を見る
                      <span>→</span>
                    </Link>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
