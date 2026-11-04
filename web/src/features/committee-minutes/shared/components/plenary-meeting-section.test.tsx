// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  type PlenaryMeeting,
  PlenaryMeetingSection,
} from "./plenary-meeting-section";

function renderMeeting(meeting: PlenaryMeeting): HTMLElement {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(
    <PlenaryMeetingSection meeting={meeting} />
  );
  return container;
}

describe("PlenaryMeetingSection", () => {
  it("shows that a meeting without sessions is being updated", () => {
    const section = renderMeeting({
      id: 3,
      title: "令和8年 第3回定例会",
      date: "2026-09-01",
      sessions: [],
    });

    expect(section.querySelector("h2")?.textContent).toContain(
      "令和8年 第3回定例会"
    );
    expect(section.querySelector("h2")?.textContent).toContain("更新中");
    expect(section.querySelector("h2")?.textContent).toContain(
      "議事録を更新中"
    );
    expect(section.textContent).toContain("議事録を更新中です。");
    expect(section.querySelector("details")).toBeNull();
    expect(section.querySelector("a")).toBeNull();
  });

  it("marks a session with empty minutes as updating without an empty link", () => {
    const section = renderMeeting({
      id: 3,
      title: "令和8年 第3回定例会",
      date: "2026-09-01",
      sessions: [
        {
          id: 31,
          session_title: "第1号",
          content: " \n　",
          summary: " ",
        },
      ],
    });

    expect(section.querySelector("h2")?.textContent).toContain("更新中");
    expect(section.querySelector("h3")?.textContent).toContain("更新中");
    expect(section.querySelector("details")?.textContent).toContain(
      "議事録を更新中です。"
    );
    expect(section.querySelector("a")).toBeNull();
  });

  it("preserves published and partial sessions while marking missing minutes", () => {
    const section = renderMeeting({
      id: 2,
      title: "令和8年 第2回定例会",
      date: "2026-06-12",
      sessions: [
        {
          id: 9,
          session_title: "第1号",
          date: "2026-06-12",
          content: "議事録の本文",
          summary: "公開済みの要約",
          decisions: "決定事項",
        },
        {
          id: 10,
          session_title: "第2号",
          content: null,
          summary: "先に公開された要約",
        },
        {
          id: 11,
          session_title: "第3号",
          content: null,
        },
      ],
    });
    const sessions = section.querySelectorAll("details");

    expect(section.querySelector("h2")?.textContent).not.toContain("更新中");
    expect(sessions[0].querySelector("h3")?.textContent).not.toContain(
      "更新中"
    );
    expect(sessions[0].textContent).toContain("公開済みの要約");
    expect(sessions[0].textContent).toContain("決定事項");
    expect(sessions[0].querySelector("a")?.getAttribute("href")).toBe(
      "/committees/plenary/2/9"
    );
    expect(sessions[1].querySelector("h3")?.textContent).toContain("更新中");
    expect(sessions[1].textContent).toContain("先に公開された要約");
    expect(sessions[1].querySelector("a")?.getAttribute("href")).toBe(
      "/committees/plenary/2/10"
    );
    expect(sessions[2].querySelector("h3")?.textContent).toContain("更新中");
    expect(sessions[2].querySelector("a")).toBeNull();
  });
});
