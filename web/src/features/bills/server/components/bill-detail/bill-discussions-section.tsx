import { MessageSquare } from "lucide-react";
import Link from "next/link";
import type { BillDiscussion } from "../../loaders/get-bill-discussions";

interface BillDiscussionsSectionProps {
  discussions: BillDiscussion[];
  overviewPoints?: string[];
}

export function BillDiscussionsSection({
  discussions,
  overviewPoints,
}: BillDiscussionsSectionProps) {
  if (discussions.length === 0) {
    return null;
  }

  const hasOverview = overviewPoints && overviewPoints.length > 0;

  return (
    <section className="bg-card rounded-xl p-6">
      <h2 className="text-lg font-bold text-mirai-text mb-5 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        議会での審議
      </h2>

      {/* 総論 */}
      {hasOverview && (
        <div className="mb-6 p-4 bg-mirai-surface rounded-lg">
          <p className="text-xs font-semibold text-mirai-text-muted uppercase tracking-wide mb-3">
            この議案で議論されたこと
          </p>
          <ul className="space-y-2">
            {overviewPoints.map((point) => (
              <li
                key={point}
                className="flex items-start gap-2 text-sm text-mirai-text"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
          <p className="text-xs text-mirai-text-muted mt-3">
            {discussions.length}名の議員が質疑を行いました
          </p>
        </div>
      )}

      <div className="space-y-6">
        {discussions.map((discussion) => (
          <DiscussionCard key={discussion.id} discussion={discussion} />
        ))}
      </div>
    </section>
  );
}

function DiscussionCard({ discussion }: { discussion: BillDiscussion }) {
  const questionerLabel = [
    discussion.questioner_name,
    discussion.questioner_number ? `${discussion.questioner_number}番` : null,
    discussion.questioner_party,
  ]
    .filter(Boolean)
    .join("・");

  return (
    <div className="border border-mirai-border rounded-lg overflow-hidden">
      {/* 質問者 */}
      <div className="bg-mirai-surface px-4 py-3">
        {discussion.politician_id ? (
          <Link
            href={`/politicians/${discussion.politician_id}`}
            className="text-sm font-semibold text-mirai-text hover:underline"
          >
            {questionerLabel}
          </Link>
        ) : (
          <p className="text-sm font-semibold text-mirai-text">
            {questionerLabel}
          </p>
        )}
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* 質問のポイント */}
        {discussion.question_summary && (
          <div>
            <p className="text-xs font-semibold text-mirai-text-muted uppercase tracking-wide mb-1">
              質問のポイント
            </p>
            <p className="text-sm text-mirai-text leading-relaxed">
              {discussion.question_summary}
            </p>
          </div>
        )}

        {/* 答弁 */}
        {discussion.answer_summary && (
          <div className="border-t border-mirai-border pt-4">
            {(discussion.answerer_role || discussion.answerer_name) && (
              <p className="text-xs font-semibold text-mirai-text-muted uppercase tracking-wide mb-1">
                {discussion.answerer_role && discussion.answerer_name
                  ? `${discussion.answerer_role}（${discussion.answerer_name}）`
                  : (discussion.answerer_role ?? discussion.answerer_name)}
                {"  "}
                の答弁
              </p>
            )}
            <p className="text-sm text-mirai-text leading-relaxed">
              {discussion.answer_summary}
            </p>
          </div>
        )}

        {/* 往復回数 */}
        <div className="text-right">
          <span className="text-xs text-mirai-text-muted">
            往復{" "}
            <span className="font-semibold">{discussion.exchange_count}</span>{" "}
            回
          </span>
        </div>
      </div>
    </div>
  );
}
