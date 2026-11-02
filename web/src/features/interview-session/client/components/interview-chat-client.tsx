"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import { Button } from "@/components/ui/button";
import { useInterviewChat } from "../hooks/use-interview-chat";
import { useInterviewRating } from "../hooks/use-interview-rating";
import { useInterviewTimer } from "../hooks/use-interview-timer";
import { calcInterviewProgress } from "../utils/calc-interview-progress";
import {
  getInterviewWrapUpState,
  hasCurrentInterviewReport,
  INTERVIEW_CONTINUE_REQUEST_MESSAGE,
  INTERVIEW_SKIP_TOPIC_MESSAGE,
} from "../utils/interview-wrap-up";
import { InterviewChatInput } from "./interview-chat-input";
import { InterviewErrorDisplay } from "./interview-error-display";
import { InterviewMessage } from "./interview-message";
import { InterviewProgressBar } from "./interview-progress-bar";
import { InterviewRatingWidget } from "./interview-rating-widget";
import { InterviewSummaryInput } from "./interview-summary-input";
import { InterviewWrapUpPrompt } from "./interview-wrap-up-prompt";
import { QuickReplyButtons } from "./quick-reply-buttons";
import { NicknameDialog } from "./nickname-dialog";
import { submitInterviewNickname } from "../../server/actions/submit-interview-nickname";

interface InterviewChatClientProps {
  billId: string;
  sessionId: string;
  /** 初期表示の挨拶に使う議案タイトル */
  billTitle?: string;
  initialMessages: Array<{
    id: string;
    role: "assistant" | "user";
    content: string;
    created_at: string;
  }>;
  mode?: "loop" | "bulk";
  totalQuestions?: number;
  estimatedDuration?: number | null;
  sessionStartedAt?: string;
  hasRated?: boolean;
  previewToken?: string;
}

export function InterviewChatClient({
  billId,
  sessionId,
  billTitle,
  initialMessages,
  mode,
  totalQuestions,
  estimatedDuration,
  sessionStartedAt,
  hasRated,
  previewToken,
}: InterviewChatClientProps) {
  const {
    input,
    setInput,
    stage,
    messages,
    isLoading,
    error,
    object,
    streamingReportData,
    currentQuickReplies,
    streamingQuickReplies,
    canRetry,
    handleSubmit,
    handleQuickReply,
    handleRequestSummary,
    handleRetry,
  } = useInterviewChat({
    billId,
    initialMessages,
  });

  const { remainingMinutes, isTimeUp } = useInterviewTimer({
    estimatedDuration,
    sessionStartedAt,
  });

  const [timeUpDismissed, setTimeUpDismissed] = useState(false);
  const [dismissedAfterAnswers, setDismissedAfterAnswers] = useState<
    number | null
  >(null);
  const [userNickname, setUserNickname] = useState<string | null>(null);

  const wrapUp = getInterviewWrapUpState(messages, dismissedAfterAnswers);

  const progress = useMemo(
    () => calcInterviewProgress(totalQuestions, stage, messages),
    [messages, totalQuestions, stage]
  );

  const { showRating, handleRatingDismiss } = useInterviewRating({
    mode,
    progress,
    hasRated,
  });

  const showProgressBar = mode === "loop" && progress !== null;
  const timerMinutes =
    remainingMinutes !== null && stage === "chat" && !timeUpDismissed
      ? remainingMinutes
      : null;
  const isTimeUpPrompt = isTimeUp && !timeUpDismissed;
  const showWrapUpPrompt =
    stage === "chat" &&
    !isLoading &&
    !error &&
    (isTimeUpPrompt || wrapUp.shouldSuggest);
  const hasDraft = input.trim().length > 0;

  const dismissWrapUpIfNeeded = useCallback(() => {
    if (showWrapUpPrompt) {
      setDismissedAfterAnswers(wrapUp.answerCount);
      if (isTimeUpPrompt) {
        setTimeUpDismissed(true);
      }
    }
  }, [isTimeUpPrompt, showWrapUpPrompt, wrapUp.answerCount]);

  const handleChatSubmit = useCallback(
    (params: { text?: string }) => {
      if (params.text) {
        dismissWrapUpIfNeeded();
      }
      handleSubmit(params);
    },
    [dismissWrapUpIfNeeded, handleSubmit]
  );

  const handleChatQuickReply = useCallback(
    (text: string) => {
      dismissWrapUpIfNeeded();
      handleQuickReply(text);
    },
    [dismissWrapUpIfNeeded, handleQuickReply]
  );

  const handleSkipTopic = () => {
    dismissWrapUpIfNeeded();
    handleSubmit({ text: INTERVIEW_SKIP_TOPIC_MESSAGE });
  };

  const handleEndInterview = () => {
    if (isTimeUpPrompt) {
      setTimeUpDismissed(true);
    }
    setDismissedAfterAnswers(wrapUp.answerCount);
    handleRequestSummary();
  };

  const handleContinueInterview = () => {
    if (isTimeUpPrompt) {
      setTimeUpDismissed(true);
    }
    setDismissedAfterAnswers(wrapUp.answerCount);
    if (wrapUp.suggestedByAi && !hasDraft) {
      handleSubmit({ text: INTERVIEW_CONTINUE_REQUEST_MESSAGE });
    }
  };

  // ストリーミング中のメッセージがすでに会話履歴に追加されているかどうか
  const isStreamingMessageCommitted =
    object &&
    messages.some((m) => m.role === "assistant" && m.content === object.text);

  // ストリーミング中のメッセージを表示するかどうか
  const showStreamingMessage = object && !isStreamingMessageCommitted && !error;

  const hasReport = hasCurrentInterviewReport(messages);

  return (
    <div className="h-[calc(100dvh-96px)] bg-mirai-surface-light">
      <div className="flex flex-col h-full pt-4 bg-white md:rounded-t-[36px] md:px-12">
        {showProgressBar && progress && (
          <div className="px-4 pb-1">
            <InterviewProgressBar
              percentage={progress.percentage}
              currentTopic={progress.currentTopic}
              showSkip={progress.showSkip}
              onSkip={handleSkipTopic}
              disabled={isLoading || hasDraft}
              remainingMinutes={timerMinutes}
            />
          </div>
        )}
        <Conversation className="min-h-0 flex-1 overflow-y-auto">
          <ConversationContent className="flex flex-col gap-4">
            {/* 初期表示メッセージ */}
            {messages.length === 0 && !object && (
              <div className="flex flex-col gap-4">
                <p className="text-sm font-bold leading-[1.8] text-mirai-text">
                  あ、来てくれてありがとう！
                  {billTitle ? `「${billTitle}」` : "この取り組み"}
                  について、ざっくばらんにあなたの本音を教えてほしいっちゃ。
                </p>
                <p className="text-sm text-gray-600">
                  思ったことをそのまま話してくれたらいいけんな。
                </p>
              </div>
            )}

            {/* メッセージ一覧を表示 */}
            {messages.map((message) => (
              <InterviewMessage
                key={message.id}
                message={{
                  id: message.id,
                  role: message.role,
                  parts: [{ type: "text" as const, text: message.content }],
                }}
                isStreaming={false}
                report={message.report}
              />
            ))}

            {/* ストリーミング中のAIレスポンスを表示 */}
            {showStreamingMessage && (
              <InterviewMessage
                key="streaming-assistant"
                message={{
                  id: "streaming-assistant",
                  role: "assistant",
                  parts: [{ type: "text" as const, text: object.text ?? "" }],
                }}
                isStreaming={isLoading}
                report={streamingReportData}
              />
            )}

            {/* ローディング表示 */}
            {isLoading && !object && (
              <span className="text-sm text-gray-500">考え中...</span>
            )}

            {/* エラー表示 */}
            <InterviewErrorDisplay
              error={error}
              canRetry={canRetry}
              onRetry={handleRetry}
              isRetrying={isLoading}
            />

            {/* クイックリプライボタン */}
            {stage === "chat" &&
              (() => {
                const replies = isLoading
                  ? streamingQuickReplies
                  : wrapUp.suggestedByAi
                    ? []
                    : currentQuickReplies;
                return (
                  replies.length > 0 && (
                    <QuickReplyButtons
                      replies={replies}
                      onSelect={handleChatQuickReply}
                      disabled={isLoading}
                    />
                  )
                );
              })()}
          </ConversationContent>
        </Conversation>

        {/* 評価ウィジェット */}
        {showRating && (
          <div className="shrink-0 py-2">
            <InterviewRatingWidget
              sessionId={sessionId}
              onDismiss={handleRatingDismiss}
            />
          </div>
        )}

        {showWrapUpPrompt && (
          <InterviewWrapUpPrompt
            reason={isTimeUpPrompt ? "time" : "conversation"}
            onSummarize={handleEndInterview}
            onContinue={handleContinueInterview}
            canSummarize={wrapUp.answerCount > 0}
            hasDraft={hasDraft}
          />
        )}

        {/* 入力エリア */}
        <div className="px-6 pb-4 pt-2">
          {(stage === "summary" || stage === "summary_complete") && (
            <InterviewSummaryInput
              sessionId={sessionId}
              billId={billId}
              hasReport={hasReport}
              previewToken={previewToken}
              input={input}
              onInputChange={setInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          )}

          {stage === "chat" && (
            <>
              {!showWrapUpPrompt && wrapUp.answerCount > 0 && (
                <div className="mb-1 flex flex-wrap items-center justify-end gap-2">
                  {hasDraft && (
                    <span className="text-xs text-mirai-text-secondary">
                      入力中の内容は先に送信してください。
                    </span>
                  )}
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleEndInterview}
                    disabled={isLoading || !!error || hasDraft}
                    className="h-auto p-0 text-primary-accent"
                  >
                    これまでのお話をまとめる
                  </Button>
                </div>
              )}
              <InterviewChatInput
                input={input}
                onInputChange={setInput}
                onSubmit={handleChatSubmit}
                placeholder="AIに質問に回答する"
                isResponding={isLoading}
              />
            </>
          )}
        </div>

        <NicknameDialog
          isOpen={!userNickname}
          onConfirm={(name) => {
            setUserNickname(name);
            // セッションに保存（失敗してもチャットは継続できるため待たない）
            void submitInterviewNickname(sessionId, name);
          }}
        />
      </div>
    </div>
  );
}
