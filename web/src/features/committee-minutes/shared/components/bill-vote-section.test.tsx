// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getFactionDirectorySectionId } from "@/features/politicians/shared/utils/faction-directory-links";
import { BILL_VOTE_SNAPSHOTS } from "../data/bill-vote-snapshots";
import type { BillVoteSnapshot } from "../types/bill-vote";
import { BillVoteSection } from "./bill-vote-section";

function renderVotes(
  snapshot: BillVoteSnapshot,
  profiles: Map<string, string>,
  currentFactions: ReadonlySet<string>
) {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(
    <BillVoteSection
      snapshot={snapshot}
      profiles={profiles}
      currentFactions={currentFactions}
    />
  );
  return container;
}

describe("BillVoteSection", () => {
  it("explains the budget scope and links the source, faction, and people", () => {
    const snapshot = BILL_VOTE_SNAPSHOTS[0];
    const container = renderVotes(
      snapshot,
      new Map([
        ["34583c8e-8c39-4671-b6e1-514f67e33afe", "高松 大樹"],
        ["9ef161c1-c791-4a35-aa05-eabe91413435", "田島 寛信"],
      ]),
      new Set(["自由民主党", "日本共産党", "地域政党おおいた。"])
    );

    expect(container.textContent).toContain("イノシシ対策だけではなく");
    expect(container.textContent).toContain("一般会計予算全体への賛否");
    expect(container.textContent).toContain("賛成 40人");
    expect(container.textContent).toContain("反対 2人");
    expect(container.textContent).toContain("自由民主党（投票者12人）");
    expect(container.textContent).toContain("日本共産党（投票者2人）");
    expect(container.textContent).toContain("議長（採決に参加せず）");
    expect(
      container.querySelector(
        `a[href="/politicians#${getFactionDirectorySectionId("自由民主党")}"]`
      )?.textContent
    ).toBe("自由民主党");
    expect(
      container.querySelector(
        `a[href="/politicians#${getFactionDirectorySectionId("日本共産党")}"]`
      )?.textContent
    ).toBe("日本共産党");
    expect(
      container.querySelector(
        `a[href="/politicians#${getFactionDirectorySectionId("地域政党おおいた。")}"]`
      )?.textContent
    ).toBe("地域政党おおいた。");
    expect(
      container.querySelector(
        'a[href="/politicians/34583c8e-8c39-4671-b6e1-514f67e33afe"]'
      )?.textContent
    ).toBe("高松 大樹");
    expect(
      container.querySelector(
        'a[href="/politicians/9ef161c1-c791-4a35-aa05-eabe91413435"]'
      )?.textContent
    ).toBe("田島 寛信");
    expect(
      container.querySelector(`a[href="${snapshot.sourceUrl}#page=1"]`)
    ).not.toBeNull();
  });

  it("does not link a person to a missing or mismatched profile", () => {
    const snapshot = BILL_VOTE_SNAPSHOTS[0];
    const container = renderVotes(
      snapshot,
      new Map([["34583c8e-8c39-4671-b6e1-514f67e33afe", "別の議員"]]),
      new Set()
    );
    expect(container.textContent).toContain("高松 大樹");
    expect(
      container.querySelector(
        'a[href="/politicians/34583c8e-8c39-4671-b6e1-514f67e33afe"]'
      )
    ).toBeNull();
    expect(
      container.querySelector(
        'a[href="/politicians/9ef161c1-c791-4a35-aa05-eabe91413435"]'
      )
    ).toBeNull();
  });

  it("explains and links to the directory when a historical faction is absent", () => {
    const container = renderVotes(
      BILL_VOTE_SNAPSHOTS[0],
      new Map(),
      new Set(["現在の会派"])
    );
    const fallbackLink = container.querySelector(
      'a[href="/politicians#councillors-directory-heading"]'
    );

    expect(fallbackLink?.textContent).toBe("自由民主党");
    expect(fallbackLink?.getAttribute("aria-label")).toBe(
      "自由民主党について現在の議員一覧を表示"
    );
    expect(fallbackLink?.closest("li")?.textContent).toContain(
      "現在の議員一覧に同名の会派はありません。"
    );
    expect(
      container.querySelector('a[href^="/politicians#faction-"]')
    ).toBeNull();
  });

  it("shows members individually when their faction votes differently", () => {
    const snapshot: BillVoteSnapshot = {
      ...BILL_VOTE_SNAPSHOTS[1],
      votes: [
        { politicianId: "a", name: "議員A", faction: "会派A", result: "for" },
        {
          politicianId: "b",
          name: "議員B",
          faction: "会派A",
          result: "against",
        },
        {
          politicianId: "c",
          name: "議員C",
          faction: "会派A",
          result: "absent",
        },
      ],
    };
    const container = renderVotes(
      snapshot,
      new Map([
        ["a", "議員A"],
        ["b", "議員B"],
        ["c", "議員C"],
      ]),
      new Set(["会派A"])
    );
    expect(
      container.querySelector('a[href="/politicians/a"]')?.textContent
    ).toBe("議員A");
    expect(
      container.querySelector('a[href="/politicians/b"]')?.textContent
    ).toBe("議員B");
    expect(container.textContent).toContain("議員C（会派A）：欠席");
    expect(
      container.querySelector(
        'a[href="/politicians#councillors-directory-heading"]'
      )
    ).toBeNull();
    expect(
      container.querySelector('a[href^="/politicians#faction-"]')
    ).toBeNull();
  });
});
