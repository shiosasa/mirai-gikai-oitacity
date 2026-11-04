import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type {
  PoliticianDiscussion,
  SpeechHighlight,
} from "../types/speech-highlight";
import { PoliticianSpeechSection } from "./politician-speech-section";

const highlight: SpeechHighlight = {
  id: "speech-1",
  title: "みんなが使いやすい移動支援を！",
  quote: "電話予約も検討してください。",
  context: "予約型の移動支援についての提案です。",
  meetingId: 9,
  sessionId: 53,
  meetingType: "委員会",
  meetingTitle: "まちづくり推進特別委員会",
  meetingDate: "2026-03-25",
};

const discussion: PoliticianDiscussion = {
  id: "discussion-1",
  question_summary: "議案について質問しました。",
  source_url: "https://example.com/video",
  bills: { id: "bill-1", name: "関連議案" },
};

describe("PoliticianSpeechSection", () => {
  it("preserves the empty message when no records exist", () => {
    const html = renderToStaticMarkup(
      <PoliticianSpeechSection
        highlights={[]}
        discussions={[]}
        invalidCount={0}
        isPreview={false}
      />
    );
    expect(html).toContain("関連する発言はまだ掲載されていません。");
  });

  it("shows a quote, its meeting and a link to the exact session", () => {
    const html = renderToStaticMarkup(
      <PoliticianSpeechSection
        highlights={[highlight]}
        discussions={[]}
        invalidCount={0}
        isPreview={true}
      />
    );
    expect(html).toContain(highlight.title);
    expect(html).toContain(highlight.quote);
    expect(html).toContain(`補足：${highlight.context}`);
    expect(html).toContain("2026/03/25");
    expect(html).toContain('href="/committees/committee/9/53"');
    expect(html).toContain("掲載前の見本");
    expect(html).not.toContain("関連する発言はまだ掲載されていません。");
  });

  it("does not render a supplement when none is provided", () => {
    const html = renderToStaticMarkup(
      <PoliticianSpeechSection
        highlights={[{ ...highlight, context: null }]}
        discussions={[]}
        invalidCount={0}
        isPreview={false}
      />
    );
    expect(html).not.toContain("補足：");
    expect(html).toContain(highlight.quote);
  });

  it("keeps existing bill discussions and video links alongside highlights", () => {
    const html = renderToStaticMarkup(
      <PoliticianSpeechSection
        highlights={[highlight]}
        discussions={[discussion]}
        invalidCount={0}
        isPreview={false}
      />
    );
    expect(html).toContain('href="/bills/bill-1"');
    expect(html).toContain("議案について質問しました。");
    expect(html).toContain('href="https://example.com/video"');
    expect(html).not.toContain("掲載前の見本");
  });

  it("explains when a source cannot be verified without hiding other records", () => {
    const html = renderToStaticMarkup(
      <PoliticianSpeechSection
        highlights={[highlight]}
        discussions={[discussion]}
        invalidCount={1}
        isPreview={false}
      />
    );
    expect(html).toContain("出典を確認できないため表示していません");
    expect(html).toContain(highlight.title);
    expect(html).toContain("議案について質問しました。");
  });
});
