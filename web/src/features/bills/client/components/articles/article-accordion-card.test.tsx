// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ArticleCard } from "../../../server/components/article-card";
import type { BillArticle, TopicSourceRef } from "../../../shared/types";
import { ArticleAccordionCard } from "./article-accordion-card";

afterEach(cleanup);

function articleWithReference(reference: TopicSourceRef): BillArticle {
  return {
    id: "article",
    bill_id: 1,
    proposal_id: null,
    title: "暮らしの話題",
    status_label: "協議",
    status_class: "status-discussions",
    category: "community_living",
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
    link_label: null,
    link_url: null,
    decision_date: null,
    created_at: "2026-11-05",
    updated_at: "2026-11-05",
    published_date: null,
    publish_status: "draft",
    first_published_at: null,
    source_refs: [reference],
  };
}

describe("article source meeting links", () => {
  it.each([
    ArticleAccordionCard,
    ArticleCard,
  ])("renders all related links in saved order in %s", (Component) => {
    const article = articleWithReference({
      meeting_type: "本会議",
      meeting_title: "会議",
      meeting_id: 1,
      session_id: 1,
      date: "",
      session_label: "",
      bill_name: null,
      bill_number: null,
      evidence_quote: null,
    });
    article.related_links = [
      { label: "資料B", url: "https://example.com/b" },
      { label: "", url: "https://example.com/a" },
    ];
    article.link_url = "https://example.com/old";
    render(<Component article={article} />);
    const expand = screen.queryByRole("button", { name: /詳細・重要/ });
    if (expand) fireEvent.click(expand);
    const links = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("https://"));
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "https://example.com/b",
      "https://example.com/a",
    ]);
    expect(links[1].textContent).toContain("詳しく見る");
  });
  it.each([
    {
      meeting_type: "委員会",
      meeting_title: "厚生常任委員会",
      meeting_id: 4,
      session_id: 24,
      date: "2026-03-24",
      session_label: "3月24日",
      bill_number: null,
      expectedLabel: "厚生常任委員会・2026/3/24→",
      expectedPath: "/committees/committee/4/24",
    },
    {
      meeting_type: "本会議",
      meeting_title: "令和8年 第1回定例会",
      meeting_id: 1,
      session_id: 8,
      date: "2026-03-26",
      session_label: "3月26日",
      bill_number: "議第10号",
      expectedLabel: "令和8年 第1回定例会・2026/3/26 議第10号→",
      expectedPath: "/committees/plenary/1/8",
    },
    {
      meeting_type: "委員会",
      meeting_title: "",
      meeting_id: 4,
      session_id: 24,
      date: "",
      session_label: "3月24日",
      bill_number: null,
      expectedLabel: "委員会・3月24日→",
      expectedPath: "/committees/committee/4/24",
    },
  ])("labels $expectedPath with its meeting and date", (testCase) => {
    render(
      <ArticleAccordionCard
        article={articleWithReference({
          ...testCase,
          bill_name: null,
          evidence_quote: null,
        })}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /詳細・重要/ }));
    const link = screen.getByRole("link", { name: testCase.expectedLabel });
    expect(link.getAttribute("href")).toBe(testCase.expectedPath);
  });
});
