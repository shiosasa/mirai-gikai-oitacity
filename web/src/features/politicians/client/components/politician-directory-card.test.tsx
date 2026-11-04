// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Politician } from "../../shared/types/politician";
import { PoliticianDirectoryCard } from "./politician-directory-card";

const politician: Politician = {
  id: "politician-1",
  name: "議員 氏名",
  name_kana: "ぎいん しめい",
  birth_date: "1975年11月1日",
  election_count: 2,
  faction: "市民クラブ",
  standing_committee: null,
  special_committee: null,
  address: null,
  contact: null,
  homepage: null,
  image_url: null,
  slug: null,
  created_at: "2026-01-01T00:00:00Z",
  number: 12,
};

describe("PoliticianDirectoryCard", () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("shows the councilor's age in the directory card", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T00:00:00Z"));
    const html = renderToStaticMarkup(
      <PoliticianDirectoryCard politician={politician} />
    );

    expect(html).toContain("年齢：51歳");
    expect(html).toContain("議席12番・当選2回");
  });

  it("omits age when the birth date is unavailable or invalid", () => {
    for (const birthDate of [null, "不明"]) {
      const html = renderToStaticMarkup(
        <PoliticianDirectoryCard
          politician={{ ...politician, birth_date: birthDate }}
        />
      );

      expect(html).not.toContain("年齢：");
    }
  });
});
