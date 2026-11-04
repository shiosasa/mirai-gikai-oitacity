// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ArticleCategoryFilter } from "./article-category-filter";

describe("ArticleCategoryFilter", () => {
  afterEach(cleanup);

  it("groups the heading and interactive categories inside the pink photo frame", () => {
    const { container } = render(<ArticleCategoryFilter articles={[]} />);
    const heading = screen.getByRole("heading", { name: "トピックス📰" });
    const frame = heading.closest("header");
    const categories = screen.getByRole("group", {
      name: "トピックスのカテゴリ",
    });
    expect(frame?.contains(categories)).toBe(true);
    expect(frame?.innerHTML).toContain("from-oita-pink-light");
    expect(frame?.querySelector("img")?.getAttribute("src")).toContain(
      "station-rooster-landscape.webp"
    );
    const childcare = screen.getByRole("button", { name: "子育て・教育" });
    fireEvent.click(childcare);
    expect(childcare.getAttribute("aria-pressed")).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "すべて" })
        .getAttribute("aria-pressed")
    ).toBe("false");
    expect(
      frame?.contains(screen.getByText("このカテゴリの記事はありません"))
    ).toBe(false);
    expect(container.querySelectorAll("header")).toHaveLength(1);
  });
});
