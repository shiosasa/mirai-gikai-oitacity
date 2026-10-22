// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import type { BillArticle } from "../../../shared/types";
import { ArticleAccordionCard } from "./article-accordion-card";

afterEach(cleanup);

const article: BillArticle = {
  publish_status: "published",
  first_published_at: "2026-09-01T00:00:00Z",
  bill_id: 1,
  category: "community_living",
  cautious_voice: "",
  created_at: "2026-09-01T00:00:00Z",
  decision_date: "2026-06-24",
  details: "",
  id: "article-1",
  link_label: null,
  link_url: null,
  point_1: "",
  point_2: "",
  point_3: "",
  positive_voice: "",
  proposal_id: null,
  reason: "",
  status_class: "審議中",
  status_label: "審議中",
  summary_line_1: "要点1",
  summary_line_2: "要点2",
  summary_line_3: "要点3",
  target_audience: "",
  title: "【住宅団地の移動支援実証実験】高齢者の足をどう守る？",
  updated_at: "2026-09-01T00:00:00Z",
  published_date: "2026-09-01",
};

describe("ArticleAccordionCard", () => {
  it("shows the summary heading as three key points", () => {
    render(createElement(ArticleAccordionCard, { article }));

    expect(screen.getByText("📢 この取り組みの３つの要点は？")).toBeDefined();
    expect(screen.queryByText(/3行でいうと/)).toBeNull();
  });

  it("lets the title use the full card width on phones", () => {
    render(createElement(ArticleAccordionCard, { article }));

    const titleRow = screen.getByRole("heading", {
      level: 3,
      name: article.title,
    }).parentElement;

    expect(titleRow?.classList.contains("col-span-2")).toBe(true);
    expect(titleRow?.classList.contains("flex-col")).toBe(true);
    expect(titleRow?.classList.contains("sm:col-span-1")).toBe(true);
    expect(titleRow?.classList.contains("sm:flex-row")).toBe(true);
  });
});
