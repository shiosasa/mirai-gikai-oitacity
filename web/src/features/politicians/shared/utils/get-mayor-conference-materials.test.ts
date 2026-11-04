import { describe, expect, it } from "vitest";
import { getMayorConferenceMaterials } from "./get-mayor-conference-materials";

describe("getMayorConferenceMaterials", () => {
  it("keeps only records that have a material URL", () => {
    const items = [
      {
        id: "1",
        title: "資料1",
        material_url: null,
        order_index: 0,
        item_type: "announcement",
        summary: null,
      },
      {
        id: "2",
        title: "資料2",
        material_url: " ",
        order_index: 1,
        item_type: "announcement",
        summary: null,
      },
      {
        id: "3",
        title: "資料3",
        material_url: "https://example.com/doc.pdf",
        order_index: 2,
        item_type: "announcement",
        summary: null,
      },
    ];

    expect(getMayorConferenceMaterials(items)).toEqual([items[2]]);
  });
});
