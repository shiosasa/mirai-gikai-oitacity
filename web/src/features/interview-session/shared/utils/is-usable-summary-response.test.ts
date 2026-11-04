import { describe, expect, it } from "vitest";
import { isUsableSummaryResponse } from "./is-usable-summary-response";

const report = {
  summary: "意見の要約",
  stance: "neutral",
  role: "general_citizen",
  role_description: "市民",
  role_title: "市民",
  municipality_connection: null,
  opinions: [{ title: "意見", content: "内容", source_message_id: null }],
  scores: {
    total: 70,
    clarity: 70,
    specificity: 70,
    impact: 70,
    constructiveness: 70,
    reasoning: "理由",
  },
};

describe("isUsableSummaryResponse", () => {
  it("完全なレポートを含む要約を受け付ける", () => {
    expect(
      isUsableSummaryResponse(
        JSON.stringify({ text: "まとめです", next_stage: "summary", report })
      )
    ).toBe(true);
  });

  it("会話を再開する応答はレポートなしでも受け付ける", () => {
    expect(
      isUsableSummaryResponse(
        JSON.stringify({
          text: "次の質問です",
          next_stage: "chat",
          report: null,
        })
      )
    ).toBe(true);
  });

  it("要約にレポートがない場合や形式が不正な場合は拒否する", () => {
    expect(
      isUsableSummaryResponse(
        JSON.stringify({
          text: "まとめです",
          next_stage: "summary",
          report: null,
        })
      )
    ).toBe(false);
    expect(
      isUsableSummaryResponse(
        JSON.stringify({
          text: "まとめです",
          next_stage: "summary",
          report: { summary: "要約", opinions: [] },
        })
      )
    ).toBe(false);
    expect(isUsableSummaryResponse("不正なJSON")).toBe(false);
  });

  it("空の意見以外に表示内容がないレポートは拒否する", () => {
    const emptyReport = {
      ...report,
      summary: null,
      stance: null,
      role: null,
      role_description: null,
      role_title: null,
      opinions: [{ title: "", content: "", source_message_id: null }],
    };

    expect(
      isUsableSummaryResponse(
        JSON.stringify({
          text: "まとめです",
          next_stage: "summary",
          report: emptyReport,
        })
      )
    ).toBe(false);
  });
});
