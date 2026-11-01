type PublishedBillCandidate = {
  id: string;
  name: string;
  publish_status: string;
  source?: string | null;
};

export function buildPublishedBillIdByName(
  bills: PublishedBillCandidate[]
): Map<string, string | null> {
  const billIdsByName = new Map<string, string | null>();

  for (const bill of bills) {
    // 議案詳細へのリンク用なので、トピックスのAIインタビュー受け皿は除外する
    if (bill.publish_status !== "published" || bill.source === "topic") {
      continue;
    }

    billIdsByName.set(bill.name, billIdsByName.has(bill.name) ? null : bill.id);
  }

  return billIdsByName;
}
