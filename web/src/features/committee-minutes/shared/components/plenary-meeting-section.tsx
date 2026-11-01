import { CalendarDays, ChevronDown } from "lucide-react";
import Link from "next/link";
import { formatJapaneseDate } from "../utils/format-japanese-date";
import {
  hasMinutesContent,
  hasSessionDetails,
  isMeetingUpdating,
  type SessionDisplayContent,
} from "../utils/minutes-availability";

type PlenarySession = SessionDisplayContent & {
  id: number;
  session_title?: string;
  date?: string;
};

export type PlenaryMeeting = {
  id: number;
  title: string;
  date: string;
  sessions: readonly PlenarySession[];
};

function UpdatingBadge() {
  return (
    <span className="rounded-full bg-oita-pink-light px-2.5 py-1 text-xs font-medium text-mirai-text-secondary">
      <span className="sr-only">議事録を</span>
      更新中
    </span>
  );
}

export function PlenaryMeetingSection({
  meeting,
}: {
  meeting: PlenaryMeeting;
}) {
  return (
    <section>
      <h2 className="mb-3 flex flex-wrap items-center gap-2 text-lg font-bold text-mirai-text">
        {meeting.title}
        {isMeetingUpdating(meeting.sessions) && <UpdatingBadge />}
      </h2>
      {meeting.sessions.length === 0 ? (
        <p className="text-sm text-mirai-text-secondary">
          議事録を更新中です。
        </p>
      ) : (
        <div className="space-y-3">
          {meeting.sessions.map((session) => {
            const isUpdating = !hasMinutesContent(session.content);

            return (
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
                      <h3 className="flex flex-wrap items-center gap-2 font-bold text-mirai-text">
                        {session.session_title || meeting.title}
                        {isUpdating && <UpdatingBadge />}
                      </h3>
                    </div>
                  </div>
                </summary>

                <div className="px-5 pb-5 border-t border-mirai-border pt-4 space-y-4">
                  {session.summary?.trim() && (
                    <div>
                      <h4 className="text-sm font-semibold text-mirai-text mb-2">
                        📋 要約
                      </h4>
                      <p className="text-sm text-mirai-text-secondary">
                        {session.summary}
                      </p>
                    </div>
                  )}

                  {session.decisions?.trim() && (
                    <div>
                      <h4 className="text-sm font-semibold text-mirai-text mb-2">
                        ✅ 決定事項
                      </h4>
                      <p className="text-sm text-mirai-text-secondary whitespace-pre-wrap">
                        {session.decisions}
                      </p>
                    </div>
                  )}

                  {isUpdating && (
                    <p className="text-sm text-mirai-text-secondary">
                      議事録を更新中です。
                    </p>
                  )}

                  {hasSessionDetails(session) && (
                    <Link
                      href={`/committees/plenary/${meeting.id}/${session.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary-accent hover:text-primary"
                    >
                      詳細を見る
                      <span>→</span>
                    </Link>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}
