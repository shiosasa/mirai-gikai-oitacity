import { describe, expect, it } from "vitest";
import { buildPublishedBillIdByName } from "./build-published-bill-id-by-name";

describe("buildPublishedBillIdByName", () => {
  it("maps a published bill name to its detail page ID", () => {
    const result = buildPublishedBillIdByName([
      {
        id: "published-bill",
        name: "学校給食費条例",
        publish_status: "published",
      },
      {
        id: "draft-bill",
        name: "未公開議案",
        publish_status: "draft",
      },
    ]);

    expect(result.get("学校給食費条例")).toBe("published-bill");
    expect(result.has("未公開議案")).toBe(false);
  });

  it("does not resolve duplicated published bill names", () => {
    const result = buildPublishedBillIdByName([
      {
        id: "bill-1",
        name: "同名議案",
        publish_status: "published",
      },
      {
        id: "bill-2",
        name: "同名議案",
        publish_status: "published",
      },
    ]);

    expect(result.get("同名議案")).toBeNull();
  });
});
