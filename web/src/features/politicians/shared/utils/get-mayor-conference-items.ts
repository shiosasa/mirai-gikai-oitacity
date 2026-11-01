import type { MayorConferenceItem } from "../types/mayor";

export function getMayorConferenceItems(
  items: MayorConferenceItem[],
  itemType: "announcement" | "qa"
): MayorConferenceItem[] {
  return items.filter((item) => item.item_type === itemType);
}
