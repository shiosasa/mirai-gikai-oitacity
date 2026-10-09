type BillReference = {
  name: string | null;
  number: string | null;
};

type BillDetail = {
  name: string;
  bill_number: string | null;
};

export function matchesBillReference(
  reference: BillReference,
  bill: BillDetail
): boolean {
  const referenceName = reference.name?.trim() ?? "";
  const referenceNumber = reference.number?.trim() ?? "";
  const billName = bill.name.trim();
  const billNumber = bill.bill_number?.trim() ?? "";

  if (referenceName && referenceNumber) {
    return referenceName === billName && referenceNumber === billNumber;
  }

  if (referenceNumber) {
    return referenceNumber === billNumber;
  }

  return Boolean(referenceName && referenceName === billName);
}
