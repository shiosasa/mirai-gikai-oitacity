import { describe, expect, it } from "vitest";
import type { OitaGeneralQuestion } from "@/app/dev/features/general-questions/oita-prototype/_lib/oita-prototype-helpers";
import { filterSearchGeneralQuestions } from "./search-general-questions";

const SAMPLE: OitaGeneralQuestion[] = [
  {
    id: "gq-1",
    sessionLabel: "令和8年 第2回定例会",
    sessionDayLabel: "2026年6月18日「令和8年 第2回定例会」",
    questionOrder: 3,
    questionerName: "大津 將嘉",
    faction: "自由民主党",
    overview: "認知症の見守りについて質問しました。",
    topics: [
      {
        id: "t-1",
        title: "認知症のお年寄りを地域で見守るしくみ",
        tag: "安心・安全・防災",
        exchanges: [
          {
            id: "e-1",
            speakerRole: "questioner",
            speakerLabel: "大津 將嘉議員",
            turnType: "質問",
            summary: "GPSを使った見守りの考えはありませんか？",
            rawText: "原文",
          },
        ],
      },
    ],
  },
];

describe("filterSearchGeneralQuestions", () => {
  it("filters by query and category", () => {
    expect(filterSearchGeneralQuestions(SAMPLE, "GPS", "すべて")).toHaveLength(
      1
    );
    expect(
      filterSearchGeneralQuestions(SAMPLE, "", "安心・安全・防災")
    ).toHaveLength(1);
    expect(
      filterSearchGeneralQuestions(SAMPLE, "", "子育て・教育")
    ).toHaveLength(0);
  });
});
