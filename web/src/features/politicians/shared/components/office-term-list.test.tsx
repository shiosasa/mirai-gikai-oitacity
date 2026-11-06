// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { OfficeTermList } from "./office-term-list";

afterEach(cleanup);
it("labels unknown dates and keeps appointment and retirement sources distinct", () => {
  render(
    <OfficeTermList
      terms={[
        {
          id: 1,
          role: "councillor",
          politician_id: "test",
          mayor_id: null,
          started_on: null,
          ended_on: "2026-04-01",
          term_number: null,
          seat_number: 1,
          faction: "記録時の会派",
          standing_committee: null,
          special_committee: null,
          source_url: "https://example.com/start",
          ended_source_url: "https://example.com/end",
        },
      ]}
    />
  );
  expect(screen.getByText(/就任日未確認 ～ 2026-04-01/)).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "就任の公式出典" }).getAttribute("href")
  ).toBe("https://example.com/start");
  expect(
    screen.getByRole("link", { name: "退任の公式出典" }).getAttribute("href")
  ).toBe("https://example.com/end");
});
