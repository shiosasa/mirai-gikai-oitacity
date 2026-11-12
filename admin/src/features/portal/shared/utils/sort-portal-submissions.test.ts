import { describe, expect, it } from "vitest";
import {
  type SubmissionWithStatus,
  sortPortalSubmissions,
} from "./sort-portal-submissions";

describe("sortPortalSubmissions", () => {
  it("未対応（pending）を最上位に、対応済み（approved / rejected）を下位に配置する", () => {
    const list: SubmissionWithStatus[] = [
      { status: "approved", created_at: "2026-11-12T10:00:00Z" },
      { status: "pending", created_at: "2026-11-11T10:00:00Z" },
      { status: "rejected", created_at: "2026-11-12T12:00:00Z" },
      { status: "pending", created_at: "2026-11-12T09:00:00Z" },
    ];

    const sorted = sortPortalSubmissions(list);

    // 上位2件は pending
    expect(sorted[0].status).toBe("pending");
    expect(sorted[1].status).toBe("pending");
    // 下位2件は approved または rejected
    expect(sorted[2].status).not.toBe("pending");
    expect(sorted[3].status).not.toBe("pending");
  });

  it("同一ステータス内では created_at の新しい順（降順）に並べ替える", () => {
    const list: SubmissionWithStatus[] = [
      { status: "pending", created_at: "2026-11-10T00:00:00Z" },
      { status: "approved", created_at: "2026-11-08T00:00:00Z" },
      { status: "pending", created_at: "2026-11-12T00:00:00Z" },
      { status: "approved", created_at: "2026-11-11T00:00:00Z" },
    ];

    const sorted = sortPortalSubmissions(list);

    // pending グループで新しい順
    expect(sorted[0]).toEqual({
      status: "pending",
      created_at: "2026-11-12T00:00:00Z",
    });
    expect(sorted[1]).toEqual({
      status: "pending",
      created_at: "2026-11-10T00:00:00Z",
    });

    // approved グループで新しい順
    expect(sorted[2]).toEqual({
      status: "approved",
      created_at: "2026-11-11T00:00:00Z",
    });
    expect(sorted[3]).toEqual({
      status: "approved",
      created_at: "2026-11-08T00:00:00Z",
    });
  });

  it("空配列を渡した場合は空配列を返す", () => {
    expect(sortPortalSubmissions([])).toEqual([]);
  });

  it("元の配列を変更しない（非破壊的）", () => {
    const original: SubmissionWithStatus[] = [
      { status: "approved", created_at: "2026-11-12T00:00:00Z" },
      { status: "pending", created_at: "2026-11-11T00:00:00Z" },
    ];
    const copy = [...original];

    sortPortalSubmissions(original);

    expect(original).toEqual(copy);
  });
});
