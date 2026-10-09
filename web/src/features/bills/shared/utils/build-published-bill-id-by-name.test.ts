import { describe, expect, it } from "vitest";
import { buildPublishedBillIdByName } from "./build-published-bill-id-by-name";

describe("buildPublishedBillIdByName", () => {
  it("公開済み議案の名前から詳細IDを解決する", () => {
    const bills = [
      {
        id: "published-bill",
        name: "子ども医療費助成条例",
        publish_status: "published",
      },
      {
        id: "draft-bill",
        name: "未公開議案",
        publish_status: "draft",
      },
    ];

    const idsByName = buildPublishedBillIdByName(bills);

    expect(idsByName.get("子ども医療費助成条例")).toBe("published-bill");
    expect(idsByName.has("未公開議案")).toBe(false);
  });

  it("同じ名前の公開済み議案が複数ある場合はリンク先を特定しない", () => {
    const bills = [
      {
        id: "first-bill",
        name: "子ども医療費助成条例",
        publish_status: "published",
      },
      {
        id: "second-bill",
        name: "子ども医療費助成条例",
        publish_status: "published",
      },
    ];

    expect(
      buildPublishedBillIdByName(bills).get("子ども医療費助成条例")
    ).toBeNull();
  });
});
