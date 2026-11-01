// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { PressConference } from "../../shared/types";
import { PressConferenceDetail } from "./press-conference-detail";

const pressConference: PressConference = {
  id: "conference-1",
  slug: "2026-09-press",
  title: "定例記者会見",
  heldAt: "2026-09-30",
  youtubeUrl: null,
  status: "published",
  items: [
    {
      id: "question-1",
      itemType: "qa",
      orderIndex: 0,
      title: "復興について",
      summary: "市長が復興の方針を説明しました。",
      materialUrl: null,
      detail: null,
      turns: [],
    },
  ],
};

describe("PressConferenceDetail", () => {
  it("explains that a question can contain a summary without a transcript", () => {
    const html = renderToStaticMarkup(
      <PressConferenceDetail pressConference={pressConference} />
    );

    expect(html).toContain(
      "タップすると要約や、登録されたやりとりを確認できます。"
    );
    expect(html).toContain("市長が復興の方針を説明しました。");
    expect(html).not.toContain("タップすると詳しいやりとりが読めます");
  });

  it("shows a preparation message when no questions are registered", () => {
    const html = renderToStaticMarkup(
      <PressConferenceDetail
        pressConference={{ ...pressConference, items: [] }}
      />
    );

    expect(html).toContain("質疑の内容は準備中です。");
    expect(html).not.toContain("タップすると要約");
  });
});
