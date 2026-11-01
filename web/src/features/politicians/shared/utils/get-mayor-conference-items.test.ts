import { describe, expect, it } from "vitest";
import { getMayorConferenceItems } from "./get-mayor-conference-items";

describe("getMayorConferenceItems", () => {
  it("keeps announcements and questions separate", () => {
    const items = [
      {
        id: "1",
        title: "発表",
        item_type: "announcement",
        summary: "発表の要約",
        material_url: null,
        order_index: 0,
      },
      {
        id: "2",
        title: "質疑",
        item_type: "qa",
        summary: "質疑の要約",
        material_url: null,
        order_index: 1,
      },
    ];

    expect(getMayorConferenceItems(items, "announcement")).toEqual([items[0]]);
    expect(getMayorConferenceItems(items, "qa")).toEqual([items[1]]);
  });
});
