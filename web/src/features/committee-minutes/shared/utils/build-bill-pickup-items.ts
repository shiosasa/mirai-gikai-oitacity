import type {
  BillPickup,
  BillPickupSource,
  PublishedBillPickupData,
} from "../types/bill-pickup";

export function buildBillPickupItems(
  sources: BillPickupSource[],
  publishedBills: PublishedBillPickupData[]
): BillPickup[] {
  const billsById = new Map(publishedBills.map((bill) => [bill.id, bill]));
  const pickupsById = new Map<string, BillPickup>();

  for (const source of sources) {
    if (!source.billId) continue;

    const bill = billsById.get(source.billId);
    if (!bill) continue;

    const pickup = pickupsById.get(bill.id) ?? {
      ...bill,
      bill_number: bill.bill_number || source.billNumber,
      references: [],
    };
    if (!pickup.bill_number && source.billNumber) {
      pickup.bill_number = source.billNumber;
    }
    const alreadyReferenced = pickup.references.some(
      (reference) =>
        reference.meetingId === source.meetingId &&
        reference.sessionId === source.sessionId
    );
    if (!alreadyReferenced) {
      const { billId: _billId, billNumber: _billNumber, ...reference } = source;
      pickup.references.push(reference);
    }
    pickupsById.set(bill.id, pickup);
  }

  return [...pickupsById.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "ja")
  );
}
