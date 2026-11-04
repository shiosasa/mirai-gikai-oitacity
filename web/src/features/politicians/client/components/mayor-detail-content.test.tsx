// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  MayorConference,
  MayorProfile,
  MayorProposal,
} from "../../shared/types/mayor";
import { MayorDetailContent } from "./mayor-detail-content";

const mayor: MayorProfile = {
  name: "市長 氏名",
  name_kana: "しちょう しめい",
  birth_date: "1957年6月5日",
  image_url: null,
  official_url: "https://example.com/mayor",
  start_date: "2023-04-23",
  term_number: 1,
  bio: "「ひとが真ん中。」を基本方針とし、「ひとを守る」「ひとを育む」「ひとを支える」「ひとを豊かに」「ひとを元気に」の5つをまちづくりの柱としています。",
};

const proposals: MayorProposal[] = [
  {
    id: 1,
    title: "定例会",
    date: "2026-09-01",
    mayor_proposal_summary: "提案理由の要約\n二行目",
    mayor_proposal_source_url: "https://example.com/official-proposal",
  },
];

const conferences: MayorConference[] = [
  {
    id: "conference-1",
    slug: "2026-09-press",
    title: "定例記者会見",
    held_at: "2026-09-30",
    youtube_url: "https://youtu.be/umZjJ0lHVZ0?si=example",
    status: "published",
    press_conference_items: [
      {
        id: "material-1",
        title: "配付資料",
        material_url: "https://example.com/material.pdf",
        order_index: 0,
        item_type: "announcement",
        summary: "発表事項の要約です。",
      },
      {
        id: "question-1",
        title: "質問",
        material_url: null,
        order_index: 1,
        item_type: "qa",
        summary: "記者との質疑の要約です。",
      },
    ],
  },
];

describe("MayorDetailContent", () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("renders the profile, proposal, video and PDF in the requested order", () => {
    const html = renderToStaticMarkup(
      <MayorDetailContent
        mayor={mayor}
        proposals={proposals}
        conferences={conferences}
        localPreview={false}
      />
    );

    expect(html.indexOf("市長プロフィール")).toBeLessThan(
      html.indexOf("市議会への提案理由")
    );
    expect(html.indexOf("市議会への提案理由")).toBeLessThan(
      html.indexOf("記者会見アーカイブ")
    );
    expect(html).toContain("ひとが真ん中。");
    expect(html).toContain("ひとを元気に");
    expect(html).toContain("提案理由の要約\n二行目");
    expect(html).toContain('href="https://example.com/official-proposal"');
    expect(html).toContain("発表事項の要約です。");
    expect(html).toContain("記者との質疑の要約です。");
    expect(html).toContain(
      'src="https://www.youtube-nocookie.com/embed/umZjJ0lHVZ0"'
    );
    expect(html).toContain('href="https://example.com/material.pdf"');
    expect(html).toContain('href="/press-conferences/2026-09-press"');
    expect(html).not.toContain("ローカル確認用");
  });

  it("keeps the biography without repeating the policy pillars", () => {
    document.body.innerHTML = renderToStaticMarkup(
      <MayorDetailContent
        mayor={mayor}
        proposals={[]}
        conferences={[]}
        localPreview={false}
      />
    );

    const profile = document.querySelector("#profile");
    expect(profile?.querySelector("figure")).toBeNull();
    expect(profile?.textContent).toContain(mayor.bio);
    expect(profile?.textContent).not.toContain("まちづくりの5つの柱");
    for (const pillar of [
      "ひとを守る",
      "ひとを育む",
      "ひとを支える",
      "ひとを豊かに",
      "ひとを元気に",
    ]) {
      expect(profile?.textContent?.split(pillar)).toHaveLength(2);
    }
  });

  it("places city hall only in the pink title frame as a faint decorative background", () => {
    document.body.innerHTML = renderToStaticMarkup(
      <MayorDetailContent
        mayor={mayor}
        proposals={[]}
        conferences={[]}
        localPreview={false}
      />
    );
    const header = document.querySelector("header");
    const image = header?.querySelector("img");
    expect(image?.getAttribute("src")).toContain("city-hall-wide.webp");
    expect(image?.getAttribute("alt")).toBe("");
    expect(image?.className).toContain("object-contain");
    expect(image?.className).toContain("opacity-20");
    expect(image?.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(header?.innerHTML).toContain("from-oita-pink-light");
    expect(document.querySelector("#profile img")).toBeNull();
    expect(header?.querySelector('a[href="#profile"]')).not.toBeNull();
  });

  it("shows clear empty states without inventing profile or archive data", () => {
    const html = renderToStaticMarkup(
      <MayorDetailContent
        mayor={null}
        proposals={[]}
        conferences={[]}
        localPreview={false}
      />
    );

    expect(html).toContain("プロフィールを準備中です");
    expect(html).toContain("提案理由は準備中です");
    expect(html).toContain("公開できる記者会見は準備中です");
  });

  it("shows a larger portrait and the age derived from the birth date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-04T15:00:00Z"));
    document.body.innerHTML = renderToStaticMarkup(
      <MayorDetailContent
        mayor={{ ...mayor, birth_date: "1957年（昭和32年）6月5日" }}
        proposals={[]}
        conferences={[]}
        localPreview={false}
      />
    );

    const avatar = document.querySelector('[data-slot="avatar"]');
    expect(avatar?.className).toContain("size-36");
    expect(avatar?.className).toContain("sm:size-48");
    expect(document.querySelector("#profile dl")?.textContent).toContain(
      "年齢69歳"
    );
  });

  it("opens and closes each proposal while preserving its summary and source", () => {
    document.body.innerHTML = renderToStaticMarkup(
      <MayorDetailContent
        mayor={mayor}
        proposals={[
          ...proposals,
          { ...proposals[0], id: 2, title: "別の定例会" },
        ]}
        conferences={[]}
        localPreview={false}
      />
    );

    const details = Array.from(
      document.querySelectorAll<HTMLDetailsElement>("#proposals details")
    );
    const [first, second] = details;
    const summary = first.querySelector("summary");
    const secondSummary = second.querySelector("summary");
    expect(details).toHaveLength(2);
    expect(first.open).toBe(false);
    expect(second.open).toBe(false);
    expect(summary?.textContent).toContain("定例会");
    expect(summary?.querySelector("h3")?.textContent).toContain("定例会");
    expect(first.textContent).toContain("提案理由の要約");
    expect(first.querySelector("a")?.getAttribute("href")).toBe(
      "https://example.com/official-proposal"
    );

    summary?.click();
    expect(first.open).toBe(true);
    expect(second.open).toBe(false);
    secondSummary?.click();
    expect(second.open).toBe(true);
    summary?.click();
    expect(first.open).toBe(false);
    expect(second.open).toBe(true);
  });

  it("keeps the pending and invalid-source states inside a proposal", () => {
    document.body.innerHTML = renderToStaticMarkup(
      <MayorDetailContent
        mayor={mayor}
        proposals={[
          {
            ...proposals[0],
            mayor_proposal_summary: null,
            mayor_proposal_source_url: "javascript:alert(1)",
          },
        ]}
        conferences={[]}
        localPreview={false}
      />
    );

    const details =
      document.querySelector<HTMLDetailsElement>("#proposals details");
    expect(details?.open).toBe(false);
    expect(details?.textContent).toContain("要約は準備中です。");
    expect(details?.textContent).toContain("原文のURLを確認できません。");
    expect(details?.querySelector("a")?.getAttribute("href")).toBe(
      "https://www.city.oita.oita.jp/shisejoho/kekakuzaise/shinozaise/teanriyu/index.html"
    );
  });

  it("shows an explicit message when a birth date cannot be calculated", () => {
    const html = renderToStaticMarkup(
      <MayorDetailContent
        mayor={{ ...mayor, birth_date: "不明" }}
        proposals={[]}
        conferences={[]}
        localPreview={false}
      />
    );

    expect(html).toContain("確認できません");
  });

  it("marks local drafts and does not link them to the published detail route", () => {
    const draft: MayorConference = {
      ...conferences[0],
      status: "draft",
      youtube_url: null,
      press_conference_items: [
        {
          id: "bad-material",
          title: "資料",
          material_url: "javascript:alert(1)",
          order_index: 0,
          item_type: "announcement",
          summary: null,
        },
      ],
    };
    const html = renderToStaticMarkup(
      <MayorDetailContent
        mayor={mayor}
        proposals={[]}
        conferences={[draft]}
        localPreview
      />
    );

    expect(html).toContain("ローカル確認用");
    expect(html).toContain("下書き");
    expect(html).toContain("動画は準備中です");
    expect(html).toContain("資料URLを確認できません");
    expect(html).not.toContain("javascript:alert");
    expect(html).not.toContain('href="/press-conferences/2026-09-press"');
  });
});
