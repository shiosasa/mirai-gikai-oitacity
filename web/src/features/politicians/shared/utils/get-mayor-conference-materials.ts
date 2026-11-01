import type { MayorConferenceItem } from "../types/mayor";

export function getMayorConferenceMaterials(
  items: MayorConferenceItem[]
): MayorConferenceItem[] {
  return items.filter((item) => item.material_url?.trim());
}
