type TopicInterview = {
  title: string;
  interview_bill_id?: string | null;
  source_refs?: { detail_bill_id?: string | null }[] | null;
};

export function getBillTopicInterviews(
  billId: string,
  articles: TopicInterview[]
) {
  const interviews = new Map<string, { billId: string; title: string }>();
  for (const article of articles) {
    if (
      article.interview_bill_id &&
      article.source_refs?.some((source) => source.detail_bill_id === billId)
    ) {
      interviews.set(article.interview_bill_id, {
        billId: article.interview_bill_id,
        title: article.title,
      });
    }
  }
  return [...interviews.values()];
}
