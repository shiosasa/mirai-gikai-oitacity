import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site.config";
import { getCouncilSessionStatus } from "./get-council-session-status";
import { selectCouncilSchedule } from "./select-council-schedule";

describe("Oita council schedule status", () => {
  it.each([
    ["2026-10-10T02:54:00Z", "閉会中（次回 Ｒ8第4回 11/30〜12/14）"],
    ["2026-11-29T14:59:59Z", "閉会中（次回 Ｒ8第4回 11/30〜12/14）"],
    ["2026-11-29T15:00:00Z", "開会中（Ｒ8第4回 11/30〜12/14）"],
    ["2026-12-14T14:59:59Z", "開会中（Ｒ8第4回 11/30〜12/14）"],
    ["2026-12-14T15:00:00Z", "閉会中（次回定例会未定）"],
  ])("switches correctly at Japanese midnight: %s", (now, label) => {
    const { currentSession, nextSession } = selectCouncilSchedule(
      siteConfig.councilSchedule,
      new Date(now)
    );
    expect(getCouncilSessionStatus(currentSession, nextSession).label).toBe(
      label
    );
  });

  it("selects the next meeting without mutating the input", () => {
    const schedules = [
      { name: "later", start_date: "2027-03-01", end_date: "2027-03-20" },
      ...siteConfig.councilSchedule,
    ];
    expect(
      selectCouncilSchedule(schedules, new Date("2026-12-15T00:00:00Z"))
        .nextSession?.name
    ).toBe("later");
    expect(schedules[0].name).toBe("later");
  });
});
