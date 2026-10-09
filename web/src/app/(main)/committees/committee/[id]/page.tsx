import { CalendarDays, ChevronDown } from "lucide-react";
import { formatJapaneseDate } from "@/features/committee-minutes/shared/utils/format-japanese-date";
import { getAllMeetingsAndCommittees } from "@/features/committee-minutes/server/loaders/get-all-meetings";
import { Container } from "@/components/layouts/container";
import Link from "next/link";

export const metadata = {
  title: "委員会 | みらいぎかいっち＠大分",
};

interface CommitteeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CommitteeDetailPage({
  params,
}: CommitteeDetailPageProps) {
  const { id } = await params;
  const { allCommitteeMeetings } = await getAllMeetingsAndCommittees();

  const committee = allCommitteeMeetings.find((m) => m.id.toString() === id);

  if (!committee) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <p className="text-sm text-mirai-text-muted">
            委員会の記録が見つかりません。
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
        <h1 className="text-2xl font-bold text-mirai-text">
          {committee.title}
        </h1>
      </div>

      <div className="space-y-3">
        {committee.sessions.map((session) => (
          <details
            key={`${committee.id}-${session.id}`}
            className="group border border-mirai-border rounded-lg bg-white hover:border-primary/50 transition-all"
          >
            <summary className="flex items-center justify-between p-5 cursor-pointer select-none">
              <div className="flex items-center gap-3">
                <ChevronDown className="w-5 h-5 text-mirai-text-muted group-open:rotate-180 transition-transform" />
                <div>
                  <div className="flex items-center gap-2 text-xs text-mirai-text-muted mb-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {formatJapaneseDate(session.date || committee.date)}
                  </div>
                  <h3 className="font-bold text-mirai-text">
                    {session.session_title
                      ? `${committee.term}${session.session_title}`
                      : committee.title}
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
                href={`/committees/committee/${committee.id}/${session.id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary-accent hover:text-primary"
              >
                詳細を見る
                <span>→</span>
              </Link>
            </div>
          </details>
        ))}
      </div>
    </Container>
  );
}
