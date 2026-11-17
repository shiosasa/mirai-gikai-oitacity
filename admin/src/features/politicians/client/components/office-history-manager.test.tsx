// @vitest-environment jsdom

import type { OfficeTerm } from "@mirai-gikai/shared/politicians/office-history";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type {
  OfficeChangeInput,
  OfficePerson,
} from "../../shared/utils/office-change";
import { OfficeHistoryManager } from "./office-history-manager";

afterEach(cleanup);
beforeAll(() =>
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )
);
afterAll(() => vi.unstubAllGlobals());
const people: OfficePerson[] = [
  { id: "1", role: "mayor", name: "旧市長の確認用人物", isCurrent: true },
  { id: "2", role: "mayor", name: "新市長の確認用人物", isCurrent: false },
];
const terms: OfficeTerm[] = [
  {
    id: 10,
    role: "mayor",
    mayor_id: 1,
    politician_id: null,
    started_on: "2020-01-01",
    ended_on: null,
    term_number: 1,
    seat_number: null,
    faction: null,
    standing_committee: null,
    special_committee: null,
    source_url: null,
    ended_source_url: null,
  },
];
function prepareReplacement() {
  fireEvent.change(screen.getByLabelText("対象の人物"), {
    target: { value: "mayor:1" },
  });
  fireEvent.change(screen.getByLabelText("操作"), {
    target: { value: "replace" },
  });
  fireEvent.change(screen.getByLabelText("後任の人物"), {
    target: { value: "2" },
  });
  fireEvent.change(screen.getByLabelText("退任日（在任最終日）"), {
    target: { value: "2026-04-01" },
  });
  fireEvent.change(screen.getByLabelText("新しい任期の就任日"), {
    target: { value: "2026-04-02" },
  });
  fireEvent.change(screen.getByLabelText("通算の期数（再就任を含む）"), {
    target: { value: "1" },
  });
  fireEvent.change(screen.getByLabelText("就退任を確認した公式出典URL"), {
    target: { value: "https://example.com/official" },
  });
  fireEvent.click(screen.getByRole("button", { name: "任期の変更を確認" }));
}
describe("OfficeHistoryManager", () => {
  it("previews both people and boundaries before making one atomic request", async () => {
    const calls: OfficeChangeInput[] = [];
    let refreshed = 0;
    render(
      <OfficeHistoryManager
        people={people}
        terms={terms}
        onSave={async (input) => {
          calls.push(input);
          return { data: { id: 11 } };
        }}
        onRefresh={() => refreshed++}
      />
    );
    prepareReplacement();
    expect(
      screen.getByRole("region", { name: "任期変更の確認" }).textContent
    ).toContain("旧市長の確認用人物 → 新市長の確認用人物");
    const button = screen.getByRole<HTMLButtonElement>("button", {
      name: "任期の変更を保存して公開",
    });
    expect(button.disabled).toBe(true);
    expect(calls).toHaveLength(0);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(button);
    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0]).toMatchObject({
      personId: "1",
      successorId: "2",
      expectedTerm: 10,
      action: "replace",
      endedOn: "2026-04-01",
      startedOn: "2026-04-02",
    });
    expect(refreshed).toBe(1);
    expect(screen.getByRole("status").textContent).toContain("削除されません");
  });
  it("invalidates confirmation when dates or the selected person change", () => {
    render(
      <OfficeHistoryManager
        people={people}
        terms={terms}
        onSave={async () => ({})}
        onRefresh={() => {}}
      />
    );
    prepareReplacement();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.change(screen.getByLabelText("新しい任期の就任日"), {
      target: { value: "2026-04-03" },
    });
    expect(screen.queryByRole("region", { name: "任期変更の確認" })).toBeNull();
    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "任期の変更を保存して公開",
      }).disabled
    ).toBe(true);
  });
  it("retains input on stale-form failures and surfaces cache warnings after success", async () => {
    let attempts = 0;
    render(
      <OfficeHistoryManager
        people={people}
        terms={terms}
        onSave={async () =>
          ++attempts === 1
            ? { error: "状態が変更されました" }
            : { data: { id: 11 }, warning: "キャッシュ更新に失敗しました" }
        }
        onRefresh={() => {}}
      />
    );
    prepareReplacement();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(
      screen.getByRole("button", { name: "任期の変更を保存して公開" })
    );
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("状態が変更")
    );
    expect(screen.getByLabelText<HTMLSelectElement>("後任の人物").value).toBe(
      "2"
    );
    fireEvent.click(
      screen.getByRole("button", { name: "任期の変更を保存して公開" })
    );
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("キャッシュ")
    );
    expect(screen.getByRole("status")).toBeTruthy();
  });
});
