import { describe, expect, it } from "vitest";
import {
  getInterviewWrapUpState,
  hasCurrentInterviewReport,
  INTERVIEW_CONTINUE_REQUEST_MESSAGE,
  INTERVIEW_SKIP_TOPIC_MESSAGE,
  INTERVIEW_SUMMARY_REQUEST_MESSAGE,
} from "./interview-wrap-up";

const report = {
  summary: "意見の要約",
  stance: null,
  role: null,
  role_description: null,
  role_title: null,
  municipality_connection: null,
  opinions: [],
};

function answers(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    role: "user" as const,
    content: `回答${index + 1}`,
  }));
}

describe("getInterviewWrapUpState", () => {
  it("最初の回答を含めて6回目から案内する", () => {
    expect(getInterviewWrapUpState(answers(5), null)).toMatchObject({
      answerCount: 5,
      shouldSuggest: false,
    });
    expect(getInterviewWrapUpState(answers(6), null)).toMatchObject({
      answerCount: 6,
      shouldSuggest: true,
    });
  });

  it("続ける選択後は追加の回答3回を目安に再案内する", () => {
    expect(getInterviewWrapUpState(answers(6), 6).shouldSuggest).toBe(false);
    expect(getInterviewWrapUpState(answers(8), 6).shouldSuggest).toBe(false);
    expect(getInterviewWrapUpState(answers(9), 6).shouldSuggest).toBe(true);
    expect(getInterviewWrapUpState(answers(5), 2).shouldSuggest).toBe(false);
    expect(getInterviewWrapUpState(answers(6), 2).shouldSuggest).toBe(true);
  });

  it("AIからのまとめ提案は6回未満でも選択肢を出す", () => {
    const messages = [
      ...answers(2),
      {
        role: "assistant" as const,
        content: "まとめますか？",
        nextStage: "summary" as const,
      },
    ];

    expect(getInterviewWrapUpState(messages, null)).toMatchObject({
      answerCount: 2,
      suggestedByAi: true,
      shouldSuggest: true,
    });
    expect(getInterviewWrapUpState(messages, 2).shouldSuggest).toBe(false);
  });

  it("回答がない場合はAIから提案されてもまとめない", () => {
    const result = getInterviewWrapUpState(
      [
        {
          role: "assistant",
          content: "まとめますか？",
          nextStage: "summary",
        },
      ],
      null
    );

    expect(result.answerCount).toBe(0);
    expect(result.shouldSuggest).toBe(false);
  });

  it("スキップ・まとめ・続行の操作と要約中の修正は回答に含めない", () => {
    const messages = [
      { role: "user" as const, content: "大分市に住んでいる" },
      { role: "user" as const, content: INTERVIEW_SKIP_TOPIC_MESSAGE },
      { role: "user" as const, content: "意見です" },
      { role: "user" as const, content: "  " },
      { role: "user" as const, content: INTERVIEW_SUMMARY_REQUEST_MESSAGE },
      {
        role: "assistant" as const,
        content: "まとめました",
        nextStage: "summary" as const,
        report,
      },
      { role: "user" as const, content: "この表現を直してください" },
      { role: "user" as const, content: INTERVIEW_CONTINUE_REQUEST_MESSAGE },
      {
        role: "assistant" as const,
        content: "続きを聞かせてください",
        nextStage: "chat" as const,
      },
      { role: "user" as const, content: "追加の意見です" },
      {
        role: "user" as const,
        content: "目安時間になりました。レポート作成に進みたいです。",
      },
    ];

    expect(getInterviewWrapUpState(messages, null).answerCount).toBe(3);
  });
});

describe("hasCurrentInterviewReport", () => {
  it("最後のメッセージがレポートの場合のみtrue", () => {
    const summary = {
      role: "assistant" as const,
      content: "まとめました",
      report,
    };

    expect(hasCurrentInterviewReport([])).toBe(false);
    expect(hasCurrentInterviewReport([summary])).toBe(true);
    expect(
      hasCurrentInterviewReport([
        summary,
        { role: "user", content: "修正してください" },
      ])
    ).toBe(false);
    expect(
      hasCurrentInterviewReport([
        summary,
        { role: "assistant", content: "続きを聞かせてください" },
      ])
    ).toBe(false);
  });
});
