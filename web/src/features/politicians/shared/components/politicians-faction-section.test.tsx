// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Politician } from "../types/politician";
import {
  getFactionDirectoryLink,
  getFactionDirectorySectionId,
} from "../utils/faction-directory-links";
import { groupPoliticiansByFaction } from "../utils/group-politicians-by-faction";
import { PoliticiansFactionSection } from "./politicians-faction-section";

const politician: Politician = {
  id: "politician-1",
  name: "議員",
  name_kana: "ぎいん",
  birth_date: null,
  election_count: 1,
  faction: " 地域政党おおいた。 ",
  standing_committee: null,
  special_committee: null,
  address: null,
  contact: null,
  homepage: null,
  image_url: null,
  slug: null,
  created_at: "",
  number: 1,
};

describe("PoliticiansFactionSection", () => {
  it("renders a named, scroll-offset heading that matches a vote link", () => {
    const group = groupPoliticiansByFaction([politician])[0];
    const container = document.createElement("div");
    container.innerHTML = renderToStaticMarkup(
      <PoliticiansFactionSection group={group} />
    );

    const headingId = getFactionDirectorySectionId(group.displayName);
    const heading = container.querySelector("h3");
    expect(heading?.id).toBe(headingId);
    expect(heading?.textContent).toBe("地域政党おおいた。");
    expect(heading?.classList.contains("scroll-mt-24")).toBe(true);
    expect(
      container.querySelector("section")?.getAttribute("aria-labelledby")
    ).toBe(headingId);
    expect(
      getFactionDirectoryLink(
        "地域政党おおいた。",
        new Set([group.displayName])
      ).href
    ).toBe(`/politicians#${headingId}`);
    expect(
      container.querySelector('a[href="/politicians/politician-1"]')
    ).not.toBeNull();
    expect(container.textContent).toContain("1名");
  });
});
