import { describe, expect, it } from "vitest";
import type { GeneralQuestion } from "@/features/general-questions/shared/types";
import {
  attachPrototypeAvatars,
  collectOitaQuestionTags,
  filterOitaQuestionsByTag,
  formatAnswererHonorific,
  formatMeetingDateLabel,
  formatQuestionerHonorific,
  inferOitaQuestionCategory,
  mapSupabaseQuestionsToPrototype,
  OITA_PROTOTYPE_QUESTIONS,
  selectLifeRelatedQuestions,
} from "./oita-prototype-helpers";

describe("oita-prototype-helpers", () => {
  it("collects unique tags in standard category order with question counts", () => {
    const tags = collectOitaQuestionTags(OITA_PROTOTYPE_QUESTIONS);
    expect(tags).toEqual([
      { tag: "子育て・教育", count: 2 },
      { tag: "安心・安全・防災", count: 1 },
      { tag: "まちづくり・暮らし", count: 1 },
      { tag: "まちの仕組み・選挙", count: 1 },
    ]);
  });

  it("filters questions by selected tag and returns all when null", () => {
    expect(
      filterOitaQuestionsByTag(OITA_PROTOTYPE_QUESTIONS, null)
    ).toHaveLength(3);
    const filtered = filterOitaQuestionsByTag(
      OITA_PROTOTYPE_QUESTIONS,
      "子育て・教育"
    );
    expect(filtered.map((item) => item.id)).toEqual([
      "oita-sample-1",
      "oita-sample-2",
    ]);
  });

  it("attaches councilor and mayor avatar URLs to questions and exchanges", () => {
    const enriched = attachPrototypeAvatars(
      OITA_PROTOTYPE_QUESTIONS,
      ["https://example.com/c1.png", "https://example.com/c2.png"],
      "https://example.com/mayor.png"
    );

    expect(enriched[0]?.avatarUrl).toBe("https://example.com/c1.png");
    expect(enriched[1]?.avatarUrl).toBe("https://example.com/c2.png");
    expect(enriched[2]?.avatarUrl).toBe("https://example.com/c1.png");
    expect(enriched[2]?.topics[0]?.exchanges[1]?.avatarUrl).toBe(
      "https://example.com/mayor.png"
    );
  });

  it("infers standard category and maps Supabase general_questions rows", () => {
    expect(inferOitaQuestionCategory("病児保育の予約改善")).toBe(
      "子育て・教育"
    );
    expect(inferOitaQuestionCategory("避難所の開設")).toBe("安心・安全・防災");
    expect(inferOitaQuestionCategory("投票率向上")).toBe("まちの仕組み・選挙");
    expect(inferOitaQuestionCategory("公共交通の充実")).toBe(
      "まちづくり・暮らし"
    );

    const rows: GeneralQuestion[] = [
      {
        id: "gq-1",
        council_session_id: "cs-1",
        politician_id: "pol-1",
        questioner_name: "大分 太郎",
        questioner_party: "大分みらい",
        questioner_number: 1,
        session_day: 2,
        question_order: 3,
        summary: "子育て支援について質問しました。",
        topics: [
          {
            title: "保育施設の充実",
            question_summary: "待機児童解消の取組は。",
            answer_summary: "定員拡充を進めます。",
            answerer_role: "市長",
            answerer_name: "大分 市長",
          },
        ],
        raw_text: "質問原文",
        answer_raw_text: "答弁原文",
        source_url: "/committees/committee/2/10",
        publish_status: "published",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];

    const mapped = mapSupabaseQuestionsToPrototype(
      rows,
      [
        {
          id: "pol-1",
          name: "大分 太郎",
          image_url: "https://example.com/p.png",
        },
      ],
      "https://example.com/m.png",
      undefined,
      {
        "/committees/committee/2/10": {
          date: "2026-06-18",
          meetingName: "令和8年 第2回定例会",
        },
      },
      Date.parse("2026-01-10T00:00:00Z")
    );

    expect(mapped[0]?.isNew).toBe(true);
    const expiredMapped = mapSupabaseQuestionsToPrototype(
      rows,
      [],
      null,
      undefined,
      undefined,
      Date.parse("2026-01-20T00:00:00Z")
    );
    expect(expiredMapped[0]?.isNew).toBe(false);

    expect(mapped[0]?.sessionDayLabel).toBe(
      "2026年6月18日「令和8年 第2回定例会」"
    );
    expect(formatMeetingDateLabel("2026-06-22", "令和8年 第2回定例会", 4)).toBe(
      "2026年6月22日「令和8年 第2回定例会」"
    );

    expect(mapped[0]?.avatarUrl).toBe("https://example.com/p.png");
    expect(mapped[0]?.minutesSummaryUrl).toBe("/committees/committee/2/10");
    expect(mapped[0]?.topics[0]?.tag).toBe("子育て・教育");
    expect(mapped[0]?.topics[0]?.exchanges[0]?.speakerLabel).toBe(
      "大分 太郎議員"
    );
    expect(mapped[0]?.topics[0]?.exchanges[1]?.speakerLabel).toBe(
      "市長・大分 市長さん"
    );
    expect(mapped[0]?.topics[0]?.exchanges[1]?.avatarUrl).toBe(
      "https://example.com/m.png"
    );

    expect(formatQuestionerHonorific("大津 將嘉")).toBe("大津 將嘉議員");
    expect(formatQuestionerHonorific("大津 將嘉議員")).toBe("大津 將嘉議員");
    expect(formatAnswererHonorific("福祉保健部長", "田崎敢")).toBe(
      "福祉保健部長・田崎敢さん"
    );

    const selected = selectLifeRelatedQuestions(mapped, 3);
    expect(selected).toHaveLength(1);
    expect(selected[0]?.id).toBe("gq-1");
  });
});
