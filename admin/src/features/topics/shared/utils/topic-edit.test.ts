import type { Database } from "@mirai-gikai/supabase";
import { describe, expect, it } from "vitest";
import {
  getEmptyTopicValues,
  getTopicEditValues,
  topicContentSchema,
  topicEditSchema,
  topicFormData,
} from "./topic-edit";

const input = {
  id: "00000000-0000-4000-8000-000000000001",
  title: "取り組み",
  category: "childcare_education",
  status_label: "審議中",
  status_class: "status-review",
  summary_line_1: "",
  summary_line_2: "",
  summary_line_3: "",
  details: "",
  reason: "",
  point_1: "",
  point_2: "",
  point_3: "",
  target_audience: "",
  positive_voice: "",
  cautious_voice: "",
  link_label: "",
  link_url: "",
  decision_date: "",
  expected_updated_at: "2026-11-03T00:00:00Z",
};

const article: Database["public"]["Tables"]["bill_articles"]["Row"] = {
  ...topicEditSchema.parse(input),
  bill_id: 1,
  proposal_id: null,
  created_at: input.expected_updated_at,
  updated_at: input.expected_updated_at,
  first_published_at: null,
  publish_status: "draft",
  source_refs: null,
  interview_bill_id: null,
  details: "記事の詳細",
  summary_line_1: "記事の要点",
};
const proposal: Database["public"]["Tables"]["proposals"]["Row"] = {
  id: 1,
  title: "旧タイトル",
  created_at: input.expected_updated_at,
  published_date: "2026-10-01",
  badge: "安心・安全・防災",
  status: "計画承認",
  statusClass: "status-settled",
  summary1: "公開の要点",
  summary2: null,
  summary3: null,
  gikaiDetail: "公開の詳細",
  reason: null,
  point1: null,
  point2: null,
  point3: null,
  impact: null,
  pro: null,
  con: null,
  giketu_date: null,
  link_label: null,
  link_url: null,
};

describe("getTopicEditValues", () => {
  it("loads the values prioritized by the public page while keeping article identity", () => {
    expect(getTopicEditValues(article, proposal)).toMatchObject({
      id: article.id,
      title: article.title,
      category: "safety_disaster",
      details: "公開の詳細",
      summary_line_1: "公開の要点",
      expected_updated_at: article.updated_at,
    });
  });
  it("falls back to article text when proposal fields are empty", () => {
    expect(
      getTopicEditValues(article, {
        ...proposal,
        badge: "",
        summary1: "",
        gikaiDetail: null,
      })
    ).toMatchObject({
      category: article.category,
      summary_line_1: "記事の要点",
      details: "記事の詳細",
    });
  });
});

describe("topicEditSchema", () => {
  it("validates every related URL and preserves list order", () => {
    const related_links = [
      { label: "資料2", url: "https://example.com/2" },
      { label: "", url: "https://example.com/1" },
    ];
    expect(
      topicEditSchema.parse({ ...input, related_links }).related_links
    ).toEqual(related_links);
    for (const url of [
      "",
      "javascript:alert(1)",
      "https://user:pass@example.com",
      "/local",
    ]) {
      expect(
        topicEditSchema.safeParse({
          ...input,
          related_links: [{ label: "資料", url }],
        }).success
      ).toBe(false);
    }
    const form = new FormData();
    form.set("related_links", JSON.stringify(related_links));
    expect(topicFormData(form).related_links).toEqual(related_links);
    form.set("related_links", "broken");
    expect(() => topicFormData(form)).toThrow();
  });
  it("loads an existing single link for editing without changing it", () => {
    expect(
      getTopicEditValues(
        {
          ...article,
          related_links: null,
          link_label: "旧資料",
          link_url: "https://example.com/old",
        },
        proposal
      ).related_links
    ).toEqual([{ label: "旧資料", url: "https://example.com/old" }]);
  });
  it("starts a new topic with blank text and validates it before creation", () => {
    const initial = getEmptyTopicValues();
    expect(initial.title).toBe("");
    expect(initial.source_refs).toEqual([]);
    expect(topicContentSchema.safeParse(initial).success).toBe(false);
    expect(
      topicContentSchema.safeParse({ ...initial, title: "手入力の記事" })
        .success
    ).toBe(true);
  });
  it("parses structured sources from the form and does not swallow malformed JSON", () => {
    const form = new FormData();
    form.set("source_refs", "[]");
    expect(topicFormData(form).source_refs).toEqual([]);
    form.set("source_refs", "not-json");
    expect(() => topicFormData(form)).toThrow();
  });
  it("allows clearing optional text and preserves unpublished content", () => {
    expect(topicEditSchema.parse(input).details).toBe("");
  });
  it.each([
    "javascript:alert(1)",
    "https://user:pass@example.com",
  ])("rejects unsafe source URL %s", (link_url) =>
    expect(topicEditSchema.safeParse({ ...input, link_url }).success).toBe(
      false
    ));
  it("does not allow changes to identity, publication dates or interview links", () => {
    const value = topicEditSchema.parse({
      ...input,
      interview_bill_id: "other",
      publish_status: "published",
      proposal_id: 8,
      first_published_at: "changed",
    });
    expect(value).not.toHaveProperty("interview_bill_id");
    expect(value).not.toHaveProperty("publish_status");
    expect(value).not.toHaveProperty("proposal_id");
    expect(value).not.toHaveProperty("first_published_at");
  });
  it("validates dates and category", () => {
    expect(
      topicEditSchema.safeParse({ ...input, decision_date: "2026-02-30" })
        .success
    ).toBe(false);
    expect(
      topicEditSchema.safeParse({ ...input, category: "unknown" }).success
    ).toBe(false);
  });
});
