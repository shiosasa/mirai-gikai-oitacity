import { describe, expect, it } from "vitest";
import {
  extractCurrentReport,
  extractReportFromMessage,
} from "./report-extraction";

describe("extractReportFromMessage", () => {
  const validReport = {
    text: "まとめです",
    report: {
      summary: "テスト要約",
      stance: "for",
      role: "general_citizen",
      role_description: "一般市民です",
      role_title: "市民",
      municipality_connection: "resident",
      opinions: [{ title: "意見1", content: "内容1", source_message_id: null }],
      scores: {
        total: 75,
        clarity: 80,
        specificity: 70,
        impact: 65,
        constructiveness: 85,
        reasoning: "よくまとまっています",
      },
    },
  };

  it("有効なJSONからレポートを抽出する", () => {
    const result = extractReportFromMessage(JSON.stringify(validReport));
    expect(result).not.toBeNull();
    expect(result?.summary).toBe("テスト要約");
    expect(result?.stance).toBe("for");
    expect(result?.role).toBe("general_citizen");
    expect(result?.municipality_connection).toBe("resident");
    expect(result?.opinions).toHaveLength(1);
    expect(result?.scores.total).toBe(75);
  });

  it("JSONでない文字列はnullを返す", () => {
    const result = extractReportFromMessage("普通のテキスト");
    expect(result).toBeNull();
  });

  it("reportフィールドがないJSONはnullを返す", () => {
    const result = extractReportFromMessage(JSON.stringify({ text: "テスト" }));
    expect(result).toBeNull();
  });

  it("旧形式のレポートは市とのつながりをnullとして抽出する", () => {
    const { municipality_connection: _, ...legacyReport } = validReport.report;
    const result = extractReportFromMessage(
      JSON.stringify({ ...validReport, report: legacyReport })
    );
    expect(result?.municipality_connection).toBeNull();
  });

  it("reportのバリデーションが失敗したらnullを返す", () => {
    const invalid = {
      text: "テスト",
      report: {
        summary: "要約",
        // stanceが不正な値
        stance: "invalid_stance",
      },
    };
    const result = extractReportFromMessage(JSON.stringify(invalid));
    expect(result).toBeNull();
  });

  it("空文字列はnullを返す", () => {
    const result = extractReportFromMessage("");
    expect(result).toBeNull();
  });

  it("スコアの小数値は丸められる", () => {
    const reportWithDecimalScores = {
      text: "まとめ",
      report: {
        ...validReport.report,
        scores: {
          total: 75.4,
          clarity: 80.6,
          specificity: 70.5,
          impact: 65.1,
          constructiveness: 85.9,
          reasoning: "スコアテスト",
        },
      },
    };
    const result = extractReportFromMessage(
      JSON.stringify(reportWithDecimalScores)
    );
    expect(result).not.toBeNull();
    expect(result?.scores.total).toBe(75);
    expect(result?.scores.clarity).toBe(81);
  });

  it("最新メッセージの有効なレポートを抽出する", () => {
    const result = extractCurrentReport([
      {
        role: "assistant",
        content: JSON.stringify({ ...validReport, next_stage: "summary" }),
      },
      { role: "user", content: "まとめてください" },
    ]);

    expect(result?.summary).toBe("テスト要約");
    expect(result?.municipality_connection).toBe("resident");
  });

  it("市とのつながりがない旧形式も最新レポートとして抽出できる", () => {
    const { municipality_connection: _, ...legacyReport } = validReport.report;
    const result = extractCurrentReport([
      {
        role: "assistant",
        content: JSON.stringify({ ...validReport, report: legacyReport }),
      },
    ]);

    expect(result?.summary).toBe("テスト要約");
    expect(result?.municipality_connection).toBeNull();
  });

  it("新しい回答や応答があれば、以前のレポートを使わない", () => {
    const oldReport = {
      role: "assistant",
      content: JSON.stringify(validReport),
    };

    expect(extractCurrentReport([])).toBeNull();
    expect(
      extractCurrentReport([
        { role: "user", content: "続きを話したいです" },
        oldReport,
      ])
    ).toBeNull();
    expect(
      extractCurrentReport([
        {
          role: "assistant",
          content: JSON.stringify({ text: "次の質問です", next_stage: "chat" }),
        },
        oldReport,
      ])
    ).toBeNull();
  });

  it("会話再開の応答にレポートが含まれていても提出に使わない", () => {
    expect(
      extractCurrentReport([
        {
          role: "assistant",
          content: JSON.stringify({ ...validReport, next_stage: "chat" }),
        },
      ])
    ).toBeNull();
  });

  it("表示用の内容があっても完全なレポートの形式でなければ使わない", () => {
    expect(
      extractCurrentReport([
        {
          role: "assistant",
          content: JSON.stringify({
            text: "まとめです",
            report: { summary: "テスト要約", opinions: [] },
          }),
        },
      ])
    ).toBeNull();
  });
});
