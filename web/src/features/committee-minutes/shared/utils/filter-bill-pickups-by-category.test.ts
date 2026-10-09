import { describe, expect, it } from "vitest";
import type { BillPickup } from "../types/bill-pickup";
import { filterBillPickupsByCategory } from "./filter-bill-pickups-by-category";

const pickups: BillPickup[] = [
  {
    id: "bill-1",
    name: "子育て支援",
    bill_number: "議第1号",
    tags: [{ id: "tag-1", label: "子育て・教育" }],
    references: [],
  },
  {
    id: "bill-2",
    name: "まちづくり",
    bill_number: null,
    tags: [{ id: "tag-2", label: "まちづくり・暮らし" }],
    references: [],
  },
];

describe("filterBillPickupsByCategory", () => {
  it("指定したタグの議案だけを返す", () => {
    expect(filterBillPickupsByCategory(pickups, "まちづくり・暮らし")).toEqual([
      pickups[1],
    ]);
  });

  it("すべてを選ぶと全議案を返す", () => {
    expect(filterBillPickupsByCategory(pickups, "すべて")).toBe(pickups);
  });
});
