type PublishedBillCandidate = {
  id: string;
  name: string;
  publish_status: string;
};

export function buildPublishedBillIdByName(
  bills: PublishedBillCandidate[]
): Map<string, string | null> {
  const billIdsByName = new Map<string, string | null>();

  for (const bill of bills) {
    if (bill.publish_status !== "published") {
      continue;
    }

    billIdsByName.set(bill.name, billIdsByName.has(bill.name) ? null : bill.id);
  }

  return billIdsByName;
}
