// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { MayorProfile } from "../../shared/types/mayor";
import { MayorDirectoryCard } from "./mayor-directory-card";

const mayor: MayorProfile = {
  name: "市長 氏名",
  name_kana: "しちょう しめい",
  birth_date: null,
  image_url: null,
  official_url: null,
  start_date: null,
  term_number: null,
  bio: "「ひとが真ん中。」を基本方針とし、「ひとを守る」「ひとを育む」「ひとを支える」「ひとを豊かに」「ひとを元気に」の5つをまちづくりの柱としています。",
};

describe("MayorDirectoryCard", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("links the larger portrait and five policy pillars to the mayor profile", () => {
    document.body.innerHTML = renderToStaticMarkup(
      <MayorDirectoryCard mayor={mayor} />
    );

    const link = document.querySelector('a[href="/politicians/mayor"]');
    expect(link?.getAttribute("aria-label")).toBe(
      "市長 氏名のプロフィールを見る"
    );
    const avatar = link?.querySelector('[data-slot="avatar"]');
    expect(avatar?.className).toContain("size-36");
    expect(avatar?.className).toContain("sm:size-48");
    expect(link?.textContent).toContain("まちづくりの5つの柱");
    expect(link?.textContent).toContain("基本方針「ひとが真ん中。」");
    expect(document.querySelector("figure")).toBeNull();
    expect(
      Array.from(link?.querySelectorAll("li") ?? [], (item) => item.textContent)
    ).toEqual([
      "ひとを守る",
      "ひとを育む",
      "ひとを支える",
      "ひとを豊かに",
      "ひとを元気に",
    ]);
  });

  it("shows the mayor's age in the directory card", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T00:00:00Z"));
    const html = renderToStaticMarkup(
      <MayorDirectoryCard mayor={{ ...mayor, birth_date: "1957年6月5日" }} />
    );

    expect(html).toContain("年齢：69歳");
  });

  it("does not invent policy pillars when the profile is unavailable", () => {
    const html = renderToStaticMarkup(<MayorDirectoryCard mayor={null} />);
    expect(html).toContain('href="/politicians/mayor"');
    expect(html).toContain("市長プロフィール");
    expect(html).not.toContain("まちづくりの5つの柱");
  });
});
