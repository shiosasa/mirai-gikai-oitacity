// @vitest-environment jsdom

import type { HomepageContent } from "@mirai-gikai/shared/homepage/content";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CurrentCouncilSession } from "./current-council-session";

afterEach(cleanup);

describe("CurrentCouncilSession component", () => {
  it("contentで設定された会期情報に基づいて開会中を表示する", () => {
    // 期間内の設定（遠い未来で確実に会期中になる日程、または今日を含む日程）
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const content = {
      sessionStatusName: "令和8年第4回定例会",
      sessionStatusStartDate: today,
      sessionStatusEndDate: today,
      sessionStatusCustomText: "",
    } as unknown as HomepageContent;

    render(
      <CurrentCouncilSession
        currentSession={null}
        nextSession={null}
        content={content}
      />
    );

    expect(screen.getByText("現在の大分市議会の活動ステータス")).toBeDefined();
    const badge = screen.getByRole("status");
    expect(badge.textContent).toContain("開会中");
    expect(badge.textContent).toContain("令和8年第4回定例会");
  });

  it("contentでカスタム文言が設定されている場合はそれが表示される", () => {
    const content = {
      sessionStatusName: "令和8年第4回定例会",
      sessionStatusStartDate: "2026-11-30",
      sessionStatusEndDate: "2026-12-14",
      sessionStatusCustomText: "令和8年第4回定例会期間",
    } as unknown as HomepageContent;

    render(
      <CurrentCouncilSession
        currentSession={null}
        nextSession={null}
        content={content}
      />
    );

    const badge = screen.getByRole("status");
    expect(badge.textContent).toBe("令和8年第4回定例会期間");
  });

  it("contentがない場合でもデフォルトの閉会中または次回日程が表示される", () => {
    render(<CurrentCouncilSession currentSession={null} nextSession={null} />);

    const badge = screen.getByRole("status");
    expect(badge.textContent).toBeTruthy();
  });
});
