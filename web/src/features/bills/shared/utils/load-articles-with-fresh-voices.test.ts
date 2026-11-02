import { describe, expect, it } from "vitest";
import type { TopicVoice } from "../types";
import { loadArticlesWithFreshVoices } from "./load-articles-with-fresh-voices";

const voice: TopicVoice = {
  reportId: "report-1",
  municipalityConnectionLabel: "大分市在住",
  stance: "for",
  roleLabel: "保護者",
  summary: "意見の要約",
};

describe("loadArticlesWithFreshVoices", () => {
  it("記事に現在採用中の声だけを対応付ける", async () => {
    const articles = [
      { id: "article-1", related_bill_id: "bill-1", voices: [] },
      { id: "article-2", related_bill_id: "bill-2", voices: [voice] },
      { id: "article-3", related_bill_id: null, voices: [voice] },
    ];

    const result = await loadArticlesWithFreshVoices(
      async () => articles,
      async () => new Map([["bill-1", [voice]]])
    );

    expect(result.map((article) => article.voices)).toEqual([[voice], [], []]);
    expect(articles[0].voices).toEqual([]);
    expect(articles[1].voices).toEqual([voice]);
  });

  it("採用と取り消しを都度取得して反映する", async () => {
    const articles = [{ id: "article-1", related_bill_id: "bill-1" }];
    let currentVoices = new Map<string, TopicVoice[]>([["bill-1", [voice]]]);
    let articleReads = 0;
    let voiceReads = 0;
    const loadArticles = async () => {
      articleReads += 1;
      return articles;
    };
    const loadVoices = async () => {
      voiceReads += 1;
      return currentVoices;
    };

    const featured = await loadArticlesWithFreshVoices(
      loadArticles,
      loadVoices
    );
    currentVoices = new Map();
    const removed = await loadArticlesWithFreshVoices(loadArticles, loadVoices);

    expect(featured[0].voices).toEqual([voice]);
    expect(removed[0].voices).toEqual([]);
    expect(articleReads).toBe(2);
    expect(voiceReads).toBe(2);
  });

  it("記事の紐付け先が変わった場合は変更後のトピックの声だけを表示する", async () => {
    let billId = "bill-1";
    const otherVoice = { ...voice, reportId: "report-2" };
    const loadArticles = async () => [
      { id: "article-1", related_bill_id: billId },
    ];
    const loadVoices = async () =>
      new Map([
        ["bill-1", [voice]],
        ["bill-2", [otherVoice]],
      ]);

    const before = await loadArticlesWithFreshVoices(loadArticles, loadVoices);
    billId = "bill-2";
    const after = await loadArticlesWithFreshVoices(loadArticles, loadVoices);

    expect(before[0].voices).toEqual([voice]);
    expect(after[0].voices).toEqual([otherVoice]);
  });

  it("記事または声の読み込みエラーを呼び出し元に伝える", async () => {
    await expect(
      loadArticlesWithFreshVoices(
        async () => {
          throw new Error("article load failed");
        },
        async () => new Map()
      )
    ).rejects.toThrow("article load failed");

    await expect(
      loadArticlesWithFreshVoices(
        async () => [],
        async () => {
          throw new Error("voice load failed");
        }
      )
    ).rejects.toThrow("voice load failed");
  });
});
