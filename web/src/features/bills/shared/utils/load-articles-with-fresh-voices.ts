import type { TopicVoice } from "../types";

type ArticleWithRelatedBill = {
  related_bill_id?: string | null;
};

export async function loadArticlesWithFreshVoices<
  T extends ArticleWithRelatedBill,
>(
  loadArticles: () => Promise<T[]>,
  loadVoices: () => Promise<ReadonlyMap<string, TopicVoice[]>>
): Promise<Array<T & { voices: TopicVoice[] }>> {
  const [articles, voicesByBillId] = await Promise.all([
    loadArticles(),
    loadVoices(),
  ]);
  return articles.map((article) => ({
    ...article,
    voices: article.related_bill_id
      ? (voicesByBillId.get(article.related_bill_id) ?? [])
      : [],
  }));
}
