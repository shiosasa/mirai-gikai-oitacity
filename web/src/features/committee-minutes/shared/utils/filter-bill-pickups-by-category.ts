import type { BillPickup } from "../types/bill-pickup";

export function filterBillPickupsByCategory(
  pickups: BillPickup[],
  category: string
): BillPickup[] {
  if (category === "すべて") return pickups;

  return pickups.filter((pickup) =>
    pickup.tags.some((tag) => tag.label === category)
  );
}
