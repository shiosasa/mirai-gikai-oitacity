import { describe, expect, it } from "vitest";
import {
  attachPrototypeAvatars,
  collectOitaQuestionTags,
  filterOitaQuestionsByTag,
  OITA_PROTOTYPE_QUESTIONS,
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
});
