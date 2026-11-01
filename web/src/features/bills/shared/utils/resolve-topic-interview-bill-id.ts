type TopicAnchorCandidate = {
  id: string;
  name: string;
  source?: string | null;
};

/**
 * トピックス記事のAIインタビュー受け皿（bills.source = 'topic'）の bills.id を解決する。
 * bill_articles.interview_bill_id があればそれを優先し、未設定ならタイトル一致で補う。
 * 議案（source = 'meeting'）にはタイトルが一致しても紐付けない。
 */
export function resolveTopicInterviewBillId(
  explicitBillId: string | null | undefined,
  topicTitle: string,
  bills: TopicAnchorCandidate[]
): string | null {
  if (explicitBillId) return explicitBillId;

  const anchor = bills.find(
    (bill) => bill.name === topicTitle && bill.source !== "meeting"
  );
  return anchor?.id ?? null;
}
