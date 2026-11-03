// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SaveFormView } from "./save-form";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("確認付き保存フォーム", () => {
  it("確認をキャンセルしたら書き込まない", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const save = vi.fn();
    const onSaved = vi.fn();
    render(
      createElement(SaveFormView, {
        save,
        onSaved,
        confirmMessage: "保存しますか？",
      })
    );
    fireEvent.click(screen.getByRole("button", { name: "保存する" }));
    expect(save).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });
  it("保存中は再送と編集を止め、成功時だけ更新する", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    let finish: (() => void) | undefined;
    const save = vi.fn(
      (_data: FormData) =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    const onSaved = vi.fn();
    render(
      createElement(
        SaveFormView,
        { save, onSaved, confirmMessage: "保存しますか？" },
        createElement("input", {
          name: "title",
          defaultValue: "確認済み内容",
          "aria-label": "タイトル",
        })
      )
    );
    fireEvent.click(screen.getByRole("button", { name: "保存する" }));
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "保存中…" })
        .disabled
    ).toBe(true);
    expect(save.mock.calls[0]?.[0].get("title")).toBe("確認済み内容");
    expect(onSaved).not.toHaveBeenCalled();
    finish?.();
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });
  it("保存失敗を表示し、入力を失わない", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const onSaved = vi.fn();
    render(
      createElement(
        SaveFormView,
        {
          save: async () => {
            throw new Error("接続できません");
          },
          onSaved,
          confirmMessage: "保存しますか？",
        },
        createElement("input", {
          name: "title",
          defaultValue: "確認済み内容",
          "aria-label": "タイトル",
        })
      )
    );
    fireEvent.click(screen.getByRole("button", { name: "保存する" }));
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "接続できません"
    );
    expect(
      screen.getByRole<HTMLInputElement>("textbox", { name: "タイトル" }).value
    ).toBe("確認済み内容");
    expect(onSaved).not.toHaveBeenCalled();
  });
});
