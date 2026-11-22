import { describe, expect, it } from "vitest";
import {
  formatMonthDayShort,
  getJSTDateString,
  resolveCouncilActivityStatus,
} from "./session-status";

describe("session-status utility functions", () => {
  describe("getJSTDateString", () => {
    it("UTCの日時をJST基準のYYYY-MM-DDに変換する", () => {
      // 2026-11-29 15:00:00 UTC は 2026-11-30 00:00:00 JST
      const date = new Date("2026-11-29T15:00:00Z");
      expect(getJSTDateString(date)).toBe("2026-11-30");

      // 2026-11-29 14:59:59 UTC は 2026-11-29 23:59:59 JST
      const dateBefore = new Date("2026-11-29T14:59:59Z");
      expect(getJSTDateString(dateBefore)).toBe("2026-11-29");
    });
  });

  describe("formatMonthDayShort", () => {
    it("YYYY-MM-DDをM/D形式にフォーマットする", () => {
      expect(formatMonthDayShort("2026-11-30")).toBe("11/30");
      expect(formatMonthDayShort("2026-03-05")).toBe("3/5");
    });

    it("不正な文字列の場合はそのまま返す", () => {
      expect(formatMonthDayShort("invalid")).toBe("invalid");
    });
  });

  describe("resolveCouncilActivityStatus", () => {
    const baseSchedule = {
      sessionStatusName: "令和8年第4回定例会",
      sessionStatusStartDate: "2026-11-30",
      sessionStatusEndDate: "2026-12-14",
    };

    it("会期前は「閉会中（次回 ...）」を返す", () => {
      const now = new Date("2026-11-20T10:00:00+09:00");
      const status = resolveCouncilActivityStatus(baseSchedule, now);
      expect(status).toEqual({
        kind: "closed",
        label: "閉会中（次回 令和8年第4回定例会 11/30〜12/14）",
      });
    });

    it("会期開始日の境界（JST 0:00）で「開会中」に切り替わる", () => {
      // 開始日直前 (2026-11-29 23:59:59 JST)
      const justBefore = new Date("2026-11-29T14:59:59Z");
      expect(resolveCouncilActivityStatus(baseSchedule, justBefore)).toEqual({
        kind: "closed",
        label: "閉会中（次回 令和8年第4回定例会 11/30〜12/14）",
      });

      // 開始日 (2026-11-30 00:00:00 JST)
      const startDate = new Date("2026-11-29T15:00:00Z");
      expect(resolveCouncilActivityStatus(baseSchedule, startDate)).toEqual({
        kind: "active",
        label: "開会中（令和8年第4回定例会 11/30〜12/14）",
      });
    });

    it("会期中は「開会中（...）」を返す", () => {
      const during = new Date("2026-12-05T12:00:00+09:00");
      const status = resolveCouncilActivityStatus(baseSchedule, during);
      expect(status).toEqual({
        kind: "active",
        label: "開会中（令和8年第4回定例会 11/30〜12/14）",
      });
    });

    it("会期最終日の境界（JST 23:59:59）まで「開会中」で、翌日「閉会中」になる", () => {
      // 最終日 (2026-12-14 23:59:59 JST)
      const lastMoment = new Date("2026-12-14T14:59:59Z");
      expect(resolveCouncilActivityStatus(baseSchedule, lastMoment)).toEqual({
        kind: "active",
        label: "開会中（令和8年第4回定例会 11/30〜12/14）",
      });

      // 終了翌日 (2026-12-15 00:00:00 JST)
      const nextDay = new Date("2026-12-14T15:00:00Z");
      expect(resolveCouncilActivityStatus(baseSchedule, nextDay)).toEqual({
        kind: "closed",
        label: "閉会中（令和8年第4回定例会は閉会しました）",
      });
    });

    it("臨時会でも正しくフォーマットされる", () => {
      const rinjiSchedule = {
        sessionStatusName: "令和8年第1回臨時会",
        sessionStatusStartDate: "2026-05-10",
        sessionStatusEndDate: "2026-05-12",
      };
      const now = new Date("2026-05-11T10:00:00+09:00");
      expect(resolveCouncilActivityStatus(rinjiSchedule, now)).toEqual({
        kind: "active",
        label: "開会中（令和8年第1回臨時会 5/10〜5/12）",
      });
    });

    it("終了日が未定の場合でも開会中が表示できる", () => {
      const openSchedule = {
        sessionStatusName: "令和8年第1回定例会",
        sessionStatusStartDate: "2026-02-20",
        sessionStatusEndDate: null,
      };
      const now = new Date("2026-02-25T10:00:00+09:00");
      expect(resolveCouncilActivityStatus(openSchedule, now)).toEqual({
        kind: "active",
        label: "開会中（令和8年第1回定例会 2/20〜）",
      });
    });

    it("カスタム文言が指定されている場合はそれが優先される", () => {
      const customSchedule = {
        ...baseSchedule,
        sessionStatusCustomText: "令和8年第4回定例会期間",
      };
      const now = new Date("2026-12-05T10:00:00+09:00");
      expect(resolveCouncilActivityStatus(customSchedule, now)).toEqual({
        kind: "active",
        label: "令和8年第4回定例会期間",
      });
    });

    it("カスタム文言が空欄または未指定の場合は自動判定される", () => {
      const blankCustomSchedule = {
        ...baseSchedule,
        sessionStatusCustomText: "   ",
      };
      const now = new Date("2026-12-05T10:00:00+09:00");
      expect(resolveCouncilActivityStatus(blankCustomSchedule, now)).toEqual({
        kind: "active",
        label: "開会中（令和8年第4回定例会 11/30〜12/14）",
      });
    });

    it("会期情報が空の場合は未定を返す", () => {
      const now = new Date("2026-11-20T10:00:00+09:00");
      expect(resolveCouncilActivityStatus({}, now)).toEqual({
        kind: "closed",
        label: "閉会中（次回定例会未定）",
      });
    });
  });
});
