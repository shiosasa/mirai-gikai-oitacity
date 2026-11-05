export async function loadSearchPages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<T[]>
): Promise<T[]> {
  const pageSize = 200;
  const results: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const page = await fetchPage(from, from + pageSize - 1);
    results.push(...page);
    if (page.length < pageSize) return results;
  }
}
