import type {
  InterviewReportViewData,
  InterviewStage,
} from "../../shared/schemas";

export const INTERVIEW_SKIP_TOPIC_MESSAGE = "次のテーマに進みたいです";
export const INTERVIEW_SUMMARY_REQUEST_MESSAGE =
  "これまでのお話をまとめてください。";
export const INTERVIEW_CONTINUE_REQUEST_MESSAGE =
  "インタビューをもう少し続けたいです。";

const SUMMARY_SUGGESTION_ANSWER_COUNT = 6;
const SUMMARY_SUGGESTION_REPEAT_INTERVAL = 3;
const controlMessages = new Set([
  INTERVIEW_SKIP_TOPIC_MESSAGE,
  INTERVIEW_SUMMARY_REQUEST_MESSAGE,
  INTERVIEW_CONTINUE_REQUEST_MESSAGE,
  "目安時間になりました。レポート作成に進みたいです。",
]);

interface WrapUpMessage {
  role: "assistant" | "user";
  content: string;
  nextStage?: InterviewStage | null;
  report?: InterviewReportViewData | null;
}

export function getInterviewWrapUpState(
  messages: WrapUpMessage[],
  dismissedAfterAnswers: number | null
) {
  let answerCount = 0;
  let inSummary = false;

  for (const message of messages) {
    if (message.role === "assistant") {
      if (message.nextStage === "chat") {
        inSummary = false;
      } else if (message.report) {
        inSummary = true;
      }
    } else {
      const content = message.content.trim();
      if (!inSummary && content && !controlMessages.has(content)) {
        answerCount += 1;
      }
    }
  }

  const lastMessage = messages[messages.length - 1];
  const suggestedByAi =
    lastMessage?.role === "assistant" &&
    !lastMessage.report &&
    (lastMessage.nextStage === "summary" ||
      lastMessage.nextStage === "summary_complete");
  const nextSuggestionAt =
    dismissedAfterAnswers === null
      ? SUMMARY_SUGGESTION_ANSWER_COUNT
      : Math.max(
          SUMMARY_SUGGESTION_ANSWER_COUNT,
          dismissedAfterAnswers + SUMMARY_SUGGESTION_REPEAT_INTERVAL
        );

  return {
    answerCount,
    suggestedByAi,
    shouldSuggest:
      answerCount > 0 &&
      (answerCount >= nextSuggestionAt ||
        (suggestedByAi &&
          (dismissedAfterAnswers === null ||
            answerCount > dismissedAfterAnswers))),
  };
}

export function hasCurrentInterviewReport(messages: WrapUpMessage[]): boolean {
  const lastMessage = messages[messages.length - 1];
  return lastMessage?.role === "assistant" && lastMessage.report != null;
}
