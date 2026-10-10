export function sortTopicsByPublicationDate<
  T extends { published_date: string | null },
>(articles: T[]): T[] {
  for (const article of articles) {
    if (
      article.published_date !== null &&
      !Number.isFinite(Date.parse(article.published_date))
    ) {
      throw new Error(`不正なサイト公開日です: ${article.published_date}`);
    }
  }
  return [...articles].sort((a, b) => {
    if (a.published_date === null) return b.published_date === null ? 0 : 1;
    if (b.published_date === null) return -1;
    return Date.parse(b.published_date) - Date.parse(a.published_date);
  });
}
