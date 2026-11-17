// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { topicEditSchema } from "../../shared/utils/topic-edit";
import { TopicEditFields } from "./topic-edit-fields";

afterEach(cleanup);
const initial = topicEditSchema.parse({
  id: "00000000-0000-4000-8000-000000000001",
  title: "既存の記事",
  category: "safety_disaster",
  status_label: "審議中",
  status_class: "status-review",
  summary_line_1: "要点1",
  summary_line_2: "",
  summary_line_3: "",
  details: "元の本文",
  reason: "",
  point_1: "",
  point_2: "",
  point_3: "",
  target_audience: "",
  positive_voice: "",
  cautious_voice: "",
  link_label: "",
  link_url: "",
  decision_date: "",
  expected_updated_at: "2026-11-03T00:00:00Z",
});

describe("TopicEditFields", () => {
  it("exposes all public article fields and previews edits without saving", () => {
    render(
      <form>
        <TopicEditFields initial={initial} />
      </form>
    );
    const title = screen.getByLabelText("記事タイトル");
    fireEvent.change(title, { target: { value: "新しいタイトル" } });
    fireEvent.change(screen.getByLabelText("取り組みの具体的な詳細内容"), {
      target: { value: "新しい本文" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "保存前に内容を確認する" })
    );
    const preview = screen.getByRole("region", {
      name: "保存前の記事プレビュー",
    });
    expect(
      within(preview).getByRole("heading", { name: "新しいタイトル" })
    ).toBeTruthy();
    expect(within(preview).getByText("新しい本文")).toBeTruthy();
    expect(screen.getByLabelText("議論の争点：慎重・懸念の声")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "関連リンクを追加" })
    ).toBeTruthy();
  });
  it("adds, edits, reorders, previews and removes links without retaining a stale preview", () => {
    render(
      <form>
        <TopicEditFields
          initial={{
            ...initial,
            related_links: [
              { label: "旧資料", url: "https://example.com/old" },
            ],
          }}
        />
      </form>
    );
    fireEvent.click(screen.getByRole("button", { name: "関連リンクを追加" }));
    fireEvent.change(screen.getByLabelText("関連リンク 2 の表示名"), {
      target: { value: "新資料" },
    });
    fireEvent.change(screen.getByLabelText("関連リンク 2 のURL"), {
      target: { value: "https://example.com/new" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "関連リンク 2 を上へ" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "保存前に内容を確認する" })
    );
    let preview = screen.getByRole("region", {
      name: "保存前の記事プレビュー",
    });
    expect(
      within(preview)
        .getAllByRole("link")
        .map((link) => link.textContent)
    ).toEqual(["新資料", "旧資料"]);
    fireEvent.click(
      screen.getByRole("button", { name: "関連リンク 1 を削除" })
    );
    expect(
      screen.queryByRole("region", { name: "保存前の記事プレビュー" })
    ).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "保存前に内容を確認する" })
    );
    preview = screen.getByRole("region", { name: "保存前の記事プレビュー" });
    expect(
      within(preview)
        .getAllByRole("link")
        .map((link) => link.textContent)
    ).toEqual(["旧資料"]);
    fireEvent.click(
      screen.getByRole("button", { name: "関連リンク 1 を削除" })
    );
    const form = screen
      .getByRole("button", { name: "保存前に内容を確認する" })
      .closest("form");
    expect(form && new FormData(form).get("related_links")).toBe("[]");
  });
});
