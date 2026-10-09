import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { GeneralQuestion } from "../../shared/types";

interface GeneralQuestionCardProps {
  question: GeneralQuestion;
}

const DAY_LABELS: Record<number, string> = {
  1: "第1日",
  2: "第2日",
  3: "第3日",
  4: "第4日",
  5: "第5日",
  6: "第6日",
};

export function GeneralQuestionCard({ question }: GeneralQuestionCardProps) {
  const dayLabel =
    DAY_LABELS[question.session_day] ?? `第${question.session_day}日`;
  const topicTitles = question.topics.map((t) => t.title).join(" / ");

  return (
    <article className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card px-5 py-4 transition-colors hover:border-primary">
      <div className="min-w-0 flex-1">
        {topicTitles && (
          <p className="mb-1 truncate text-xs text-mirai-text-secondary">
            {topicTitles}
          </p>
        )}
        {question.politician_id ? (
          <Link
            href={`/politicians/${question.politician_id}`}
            className="font-bold text-primary hover:underline"
          >
            {question.questioner_name}
          </Link>
        ) : (
          <p className="font-bold text-mirai-text">
            {question.questioner_name}
          </p>
        )}
        {question.questioner_party && (
          <p className="text-sm text-mirai-text-secondary">
            {question.questioner_party}
          </p>
        )}
        <p className="mt-1 text-xs text-mirai-text-muted">
          {dayLabel}・{question.question_order}番目
        </p>
        {question.summary && (
          <p className="mt-2 line-clamp-2 text-sm text-mirai-text">
            {question.summary}
          </p>
        )}
      </div>
      <Link
        href={`/questions/${question.id}`}
        aria-label={`${question.questioner_name}議員の質疑詳細`}
        className="mt-1 shrink-0 text-mirai-text-muted hover:text-primary"
      >
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
