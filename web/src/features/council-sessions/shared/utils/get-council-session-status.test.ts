import { describe, expect, it } from "vitest";
import { getCouncilSessionStatus } from "./get-council-session-status";

describe("getCouncilSessionStatus", () => {
  it("会期中は開始日と終了日を表示する", () => {
    expect(
      getCouncilSessionStatus(
        { start_date: "2026-06-08", end_date: "2026-06-25" },
        null
      )
    ).toEqual({ kind: "active", label: "🌸 会期中（6月8日〜6月25日）" });
  });

  it("終了日が未定の会期中は開始日まで表示する", () => {
    expect(
      getCouncilSessionStatus(
        { start_date: "2026-06-08", end_date: null },
        null
      )
    ).toEqual({ kind: "active", label: "🌸 会期中（6月8日〜）" });
  });

  it("閉会中は次回日程、なければ未定を表示する", () => {
    expect(
      getCouncilSessionStatus(null, {
        start_date: "2026-09-02",
        end_date: "2026-09-20",
      })
    ).toEqual({ kind: "closed", label: "閉会中（次回 9月2日〜）" });
    expect(getCouncilSessionStatus(null, null)).toEqual({
      kind: "closed",
      label: "閉会中（次回定例会未定）",
    });
  });
});
