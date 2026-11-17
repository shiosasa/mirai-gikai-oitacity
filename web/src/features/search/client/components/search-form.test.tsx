// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SearchForm } from "./search-form";

afterEach(cleanup);

describe("SearchForm", () => {
  it("uses a native GET form and a visible search button", () => {
    render(<SearchForm query="給食" category="子育て・教育" />);
    const form = screen.getByRole("search");
    expect(form.getAttribute("action")).toBe("/search");
    expect(form.getAttribute("method")).toBe("get");
    const submitter = screen.getByRole("button", { name: "検索" });
    expect(submitter.getAttribute("type")).toBe("submit");
    expect(submitter.getAttribute("value")).toBe("子育て・教育");
  });

  it("submits the current input when a category is selected, even without client routing", () => {
    render(<SearchForm query="古い入力" category="すべて" />);
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "新しい入力" } });
    const category = screen.getByRole("button", { name: "子育て・教育" });
    const form = input.closest("form");
    expect(form).not.toBeNull();
    const values = new FormData(form ?? undefined, category);
    expect(values.get("q")).toBe("新しい入力");
    expect(values.getAll("category")).toEqual(["子育て・教育"]);
    expect(category.getAttribute("type")).toBe("submit");
  });

  it("marks the active category and lets all clear the category filter", () => {
    render(<SearchForm query="" category="安心・安全・防災" />);
    expect(
      screen
        .getByRole("button", { name: "安心・安全・防災" })
        .getAttribute("aria-pressed")
    ).toBe("true");
    expect(
      screen.getByRole("button", { name: "すべて" }).getAttribute("value")
    ).toBe("すべて");
  });
});
