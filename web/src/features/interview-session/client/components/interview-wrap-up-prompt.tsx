"use client";

import { Button } from "@/components/ui/button";

interface InterviewWrapUpPromptProps {
  reason: "time" | "conversation";
  onSummarize: () => void;
  onContinue: () => void;
  canSummarize: boolean;
  hasDraft: boolean;
}

export function InterviewWrapUpPrompt({
  reason,
  onSummarize,
  onContinue,
  canSummarize,
  hasDraft,
}: InterviewWrapUpPromptProps) {
  return (
    <div className="mx-4 rounded-lg border border-mirai-border bg-mirai-surface-grouped p-4">
      <p className="text-sm font-medium text-mirai-text" role="status">
        {reason === "time"
          ? "目安時間になりました。これまでのお話をまとめますか？"
          : "ひと区切りです。これまでのお話をまとめますか？"}
      </p>
      <p className="mt-1 text-sm text-mirai-text-secondary">
        まだ質問が残っていても、今のお話からレポートを作れます。
      </p>
      {hasDraft && (
        <p
          id="wrap-up-draft-hint"
          className="mt-1 text-sm text-mirai-text-secondary"
        >
          入力中の内容は先に送信してください。
        </p>
      )}
      {!canSummarize && !hasDraft && (
        <p className="mt-1 text-sm text-mirai-text-secondary">
          まずは質問に回答してください。
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={onSummarize}
          disabled={!canSummarize || hasDraft}
          aria-describedby={hasDraft ? "wrap-up-draft-hint" : undefined}
        >
          これまでをまとめる
        </Button>
        <Button variant="outline" size="sm" onClick={onContinue}>
          もう少し話す
        </Button>
      </div>
    </div>
  );
}
