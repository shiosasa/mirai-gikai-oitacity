import { buildSessionPath } from "@mirai-gikai/shared/meetings/session-path";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { NewPostBadge } from "@/features/new-posts/client/components/new-post-provider";
import { formatDateJST } from "@/lib/utils/date";
import type {
  PoliticianDiscussion,
  SpeechHighlight,
} from "../types/speech-highlight";

type PoliticianSpeechSectionProps = {
  highlights: SpeechHighlight[];
  discussions: PoliticianDiscussion[];
  invalidCount: number;
  isPreview: boolean;
};

export function PoliticianSpeechSection({
  highlights,
  discussions,
  invalidCount,
  isPreview,
}: PoliticianSpeechSectionProps) {
  return (
    <section className="pt-7">
      <h2 className="text-lg font-bold text-mirai-text">議会での発言</h2>
      {isPreview && highlights.length > 0 && (
        <p className="mt-2 text-sm text-mirai-text-secondary">
          以下は掲載前の見本です。
        </p>
      )}
      {invalidCount > 0 && (
        <p className="mt-3 text-sm text-mirai-text-secondary">
          一部の発言は、議事録の出典を確認できないため表示していません。
        </p>
      )}
      {highlights.length === 0 && discussions.length === 0 ? (
        <p className="mt-3 text-sm text-mirai-text-secondary">
          関連する発言はまだ掲載されていません。
        </p>
      ) : (
        <>
          {highlights.length > 0 && (
            <ul className="mt-4 space-y-4">
              {highlights.map((highlight) => (
                <li
                  key={highlight.id}
                  className="rounded-xl border border-mirai-border bg-mirai-surface p-4 sm:p-5"
                >
                  <article>
                    <h3 className="font-bold text-mirai-text">
                      {!isPreview && (
                        <NewPostBadge
                          contentType="politician_speech_highlights"
                          contentId={highlight.id}
                        />
                      )}
                      {highlight.title}
                    </h3>
                    <blockquote className="mt-3 whitespace-pre-line border-l-2 border-oita-pink-accent pl-3 text-sm leading-7 text-mirai-text">
                      「{highlight.quote}」
                    </blockquote>
                    {highlight.context && (
                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-mirai-text-secondary">
                        補足：{highlight.context}
                      </p>
                    )}
                    <p className="mt-3 text-xs text-mirai-text-secondary">
                      {highlight.meetingTitle}・
                      {formatDateJST(highlight.meetingDate)}
                    </p>
                    <Link
                      href={buildSessionPath({
                        meeting_type: highlight.meetingType,
                        meeting_id: highlight.meetingId,
                        session_id: highlight.sessionId,
                      })}
                      className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-mirai-text underline decoration-oita-pink underline-offset-4 hover:decoration-mirai-text"
                    >
                      この議事録を見る <span aria-hidden="true">→</span>
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          )}
          {discussions.length > 0 && (
            <div className={highlights.length > 0 ? "mt-6" : ""}>
              {highlights.length > 0 && (
                <h3 className="text-sm font-bold text-mirai-text">
                  議案に関する質疑
                </h3>
              )}
              <ul className="mt-4 divide-y divide-mirai-border">
                {discussions.map((discussion) => (
                  <li key={discussion.id} className="py-4">
                    <Link
                      href={`/bills/${discussion.bills?.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {discussion.bills?.name ?? "関連議案"}
                    </Link>
                    {discussion.question_summary && (
                      <p className="mt-2 text-sm leading-6 text-mirai-text">
                        {discussion.question_summary}
                      </p>
                    )}
                    {discussion.source_url && (
                      <a
                        href={discussion.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        議会中継を見る{" "}
                        <ExternalLink aria-hidden="true" className="size-3" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
