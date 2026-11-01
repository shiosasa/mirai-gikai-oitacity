import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
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
