export function resolveTopicBillDetailId(
  sourceBillName: string | null,
  _topicTitle: string,
  _topicDetailId: string | null,
  publishedBillIdByName: Map<string, string | null>
): string | null {
  if (!sourceBillName) return null;

  return publishedBillIdByName.get(sourceBillName) ?? null;
}
