"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useMemo, useRef, useState } from "react";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
  type InterviewStage,
  interviewChatResponseSchema,
} from "@/features/interview-session/shared/schemas";
import {
  buildMessagesForApi,
  type ConversationMessage,
  convertPartialReport,
} from "../utils/message-utils";
import {
  getInterviewWrapUpState,
  INTERVIEW_SUMMARY_REQUEST_MESSAGE,
} from "../utils/interview-wrap-up";
import { useInterviewRetry } from "./use-interview-retry";
import { type InitialMessage, useParsedMessages } from "./use-parsed-messages";
import { useQuickReplies } from "./use-quick-replies";

interface UseInterviewChatProps {
  billId: string;
  initialMessages: InitialMessage[];
}

export function useInterviewChat({
  billId,
  initialMessages,
}: UseInterviewChatProps) {
  // 初期メッセージのパース
  const { parsedInitialMessages, initialStage } =
    useParsedMessages(initialMessages);

  // 基本状態
  const [input, setInput] = useState("");
  const [stage, setStage] = useState<InterviewStage>(initialStage);
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >([]);

  // onFinishコールバック内で最新の値を参照するためのref
  const stageRef = useRef<InterviewStage>(initialStage);
  stageRef.current = stage;

  // リトライロジック
  const retry = useInterviewRetry();

  // useObjectフックを使用（streamObjectの結果を受け取る）
  const { object, submit, isLoading, error } = useObject({
    api: "/api/interview/chat",
    schema: interviewChatResponseSchema,
    onFinish: ({ object: finishedObject, error: finishedError }) => {
      if (finishedError) {
        // リトライ処理を委譲
        const handled = retry.handleError(finishedError, submit);
        if (handled) return; // 自動リトライ実行済み
        return; // 手動リトライ待ち
      }

      if (finishedObject) {
        const {
          text,
          report,
          quick_replies,
          question_id,
          topic_title,
          next_stage,
        } = finishedObject;
        const questionId = question_id ?? null;
        const topicTitle = topic_title ?? null;
        const reportData =
          next_stage === "chat" ? null : convertPartialReport(report);

        if (
          stageRef.current === "summary" &&
          next_stage !== "chat" &&
          !reportData
        ) {
          retry.handleError(
            new Error("レポートを作成できませんでした。"),
            submit
          );
          return;
        }

        retry.resetRetry();

        const isChatSummarySuggestion =
          stageRef.current === "chat" &&
          (next_stage === "summary" || next_stage === "summary_complete");

        if (next_stage && !isChatSummarySuggestion) {
          stageRef.current = next_stage;
          setStage(next_stage);
        }

        const newAssistantMessage: ConversationMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: text ?? "",
          report: reportData,
          quickReplies:
            questionId && Array.isArray(quick_replies) ? quick_replies : [],
          questionId,
          topicTitle,
          nextStage: next_stage ?? null,
        };

        setConversationMessages((prev) => [...prev, newAssistantMessage]);
      } else {
        retry.handleError(
          new Error("AIの応答を読み取れませんでした。"),
          submit
        );
      }
    },
  });

  // ローディング状態
  const isChatLoading = isLoading;

  // 初期メッセージと会話履歴を統合
  const messages = [...parsedInitialMessages, ...conversationMessages];

  // クイックリプライ
  const currentQuickReplies = useQuickReplies({
    messages,
    isLoading: isChatLoading,
  });

  // objectからreportを取得（chat遷移時はストリーミング中もレポート非表示）
  const streamingReportData =
    object?.next_stage === "chat" ? null : convertPartialReport(object?.report);

  // ストリーミング中のクイックリプライ（パーシャルオブジェクトから抽出）
  const streamingQuickReplies = useMemo(() => {
    if (!isChatLoading || !object?.quick_replies) return [];
    return object.quick_replies.filter(
      (r): r is string => typeof r === "string" && r.length > 0
    );
  }, [isChatLoading, object?.quick_replies]);

  // チャットAPI送信のヘルパー（リクエストパラメータを保存）
  const submitChatMessage = (
    userMessageText: string,
    currentStage: InterviewStage,
    nextQuestionId?: string
  ) => {
    const requestParams = {
      messages: buildMessagesForApi(
        parsedInitialMessages,
        conversationMessages,
        userMessageText
      ),
      billId,
      currentStage,
      nextQuestionId,
    };
    retry.saveRequestParams(requestParams); // 失敗時の自動リトライ用に保存
    submit(requestParams);
  };

  // メッセージ送信
  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    if (!hasText || isChatLoading || stage === "summary_complete") {
      return;
    }

    const userMessageText = message.text ?? "";
    const userMessageId = `user-${Date.now()}`;

    // ユーザーメッセージを会話履歴に追加
    setConversationMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        role: "user",
        content: userMessageText,
      },
    ]);
    setInput("");

    // 現在のステージでメッセージ送信
    submitChatMessage(userMessageText, stage);
  };

  // クイックリプライを選択した時の処理
  const handleQuickReply = (reply: string) => {
    handleSubmit({ text: reply });
  };

  const handleRequestSummary = () => {
    const { answerCount } = getInterviewWrapUpState(messages, null);
    if (
      stageRef.current !== "chat" ||
      isChatLoading ||
      error ||
      retry.displayError ||
      input.trim() ||
      answerCount === 0
    ) {
      return;
    }

    setConversationMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: INTERVIEW_SUMMARY_REQUEST_MESSAGE,
      },
    ]);
    setInput("");
    stageRef.current = "summary";
    setStage("summary");
    submitChatMessage(INTERVIEW_SUMMARY_REQUEST_MESSAGE, "summary");
  };

  // 手動リトライ関数
  const handleRetry = () => {
    if (!retry.canRetry) return;

    // 保存されたリクエストパラメータでリトライ
    retry.manualRetry(submit);
  };

  return {
    // 状態
    input,
    setInput,
    stage,
    messages,
    isLoading: isChatLoading,
    error: error || retry.displayError,
    object,
    streamingReportData,
    currentQuickReplies,
    streamingQuickReplies,
    canRetry: retry.canRetry,

    // アクション
    handleSubmit,
    handleQuickReply,
    handleRequestSummary,
    handleRetry,
  };
}
