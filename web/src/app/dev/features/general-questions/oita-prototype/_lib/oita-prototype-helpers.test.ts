import { describe, expect, it } from "vitest";
import {
  collectOitaQuestionTags,
  filterOitaQuestionsByTag,
  OITA_PROTOTYPE_QUESTIONS,
} from "./oita-prototype-helpers";

describe("oita-prototype-helpers", () => {
  it("collects unique tags with question counts", () => {
    const tags = collectOitaQuestionTags(OITA_PROTOTYPE_QUESTIONS);
    expect(tags).toEqual([
      { tag: "防災・安全", count: 1 },
      { tag: "子育て・教育", count: 2 },
      { tag: "交通・まちづくり", count: 1 },
      { tag: "デジタル・行政", count: 1 },
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
});
