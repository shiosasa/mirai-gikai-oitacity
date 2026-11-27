import { describe, expect, it } from "vitest";
import { parseGeneralQuestionInput } from "./general-question-input";

const VALID_INPUT = {
  council_session_id: "session-1",
  politician_id: "pol-1",
  questioner_name: " 大津 將嘉 ",
  questioner_party: " 自由民主党 ",
  questioner_number: 1,
  session_day: 2,
  question_order: 3,
  summary: " 認知症の見守りについて質問しました。 ",
  source_url: " /committees/plenary/2/10 ",
  publish_status: "published" as const,
  topics: [
    {
      title: " 認知症高齢者の見守り ",
      question_summary: " GPSの活用は考えていますか？ ",
      answer_summary: " 国の動きを見ながら研究します。 ",
      answerer_role: " 福祉保健部長 ",
      answerer_name: " 田崎敢 ",
      question_raw_text: " 質問原文 ",
      answer_raw_text: "",
    },
  ],
};

describe("parseGeneralQuestionInput", () => {
  it("trims valid input and normalizes empty optional strings to null", () => {
    const parsed = parseGeneralQuestionInput(VALID_INPUT);
    expect(parsed.questioner_name).toBe("大津 將嘉");
    expect(parsed.source_url).toBe("/committees/plenary/2/10");
    expect(parsed.topics[0]?.question_raw_text).toBe("質問原文");
    expect(parsed.topics[0]?.answer_raw_text).toBeNull();
  });

  it("throws when required fields are empty or invalid", () => {
    expect(() =>
      parseGeneralQuestionInput({ ...VALID_INPUT, questioner_name: "  " })
    ).toThrow("質問者名を入力してください");
    expect(() =>
      parseGeneralQuestionInput({ ...VALID_INPUT, topics: [] })
    ).toThrow("トピックを1件以上追加してください");
    expect(() =>
      parseGeneralQuestionInput({ ...VALID_INPUT, source_url: "invalid-url" })
    ).toThrow("議事録要約ページURL");
  });
});
