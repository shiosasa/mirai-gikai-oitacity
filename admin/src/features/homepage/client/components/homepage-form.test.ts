// @vitest-environment jsdom

import {
  type HomepageContent,
  homepageDefaults,
} from "@mirai-gikai/shared/homepage/content";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createElement } from "react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { HomepageForm } from "./homepage-form";

afterEach(cleanup);
beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});
afterAll(() => vi.unstubAllGlobals());

function setup(options?: { saveError?: string; uploadError?: string }) {
  const saves: { content: HomepageContent; revision: number }[] = [];
  const uploads: FormData[] = [];
  render(
    createElement(HomepageForm, {
      initial: { content: { ...homepageDefaults }, revision: 4 },
      onSave: async (content, revision) => {
        saves.push({ content, revision });
        return options?.saveError
          ? { error: options.saveError }
          : { data: { content, revision: revision + 1 } };
      },
      onUpload: async (input) => {
        uploads.push(input);
        return options?.uploadError
          ? { error: options.uploadError }
          : { url: "https://example.com/upload.png" };
      },
    })
  );
  return { saves, uploads };
}

function preview() {
  fireEvent.click(screen.getByRole("button", { name: "保存前に表示を確認" }));
}

function confirmAndSave() {
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(
    screen.getByRole("button", { name: "トップページを保存して反映" })
  );
}

describe("homepage editor", () => {
  it("previews without writing, requires confirmation, and invalidates preview after editing", () => {
    const { saves, uploads } = setup();
    preview();
    expect(
      screen.getByRole("region", { name: "保存前のトップページ" })
    ).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "トップページを保存して反映" })
        .hasAttribute("disabled")
    ).toBe(true);
    expect(saves).toHaveLength(0);
    expect(uploads).toHaveLength(0);
    fireEvent.change(screen.getByLabelText("キャッチコピー"), {
      target: { value: "新しい文章" },
    });
    expect(
      screen.queryByRole("region", { name: "保存前のトップページ" })
    ).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "最後に保存した内容に戻す" })
    );
    expect(
      (screen.getByLabelText("キャッチコピー") as HTMLInputElement).value
    ).toBe(homepageDefaults.heroTitle);
  });
  it("saves the reviewed content and advances the revision for the next save", async () => {
    const { saves } = setup();
    fireEvent.change(screen.getByLabelText("キャッチコピー"), {
      target: { value: "更新タイトル" },
    });
    preview();
    confirmAndSave();
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain("保存しました")
    );
    expect(saves[0]).toMatchObject({
      content: { heroTitle: "更新タイトル" },
      revision: 4,
    });
    preview();
    confirmAndSave();
    await waitFor(() => expect(saves).toHaveLength(2));
    expect(saves[1].revision).toBe(5);
  });
  it("shows stale-save errors and preserves entered content", async () => {
    const { saves } = setup({ saveError: "他の画面で更新されています" });
    preview();
    confirmAndSave();
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("他の画面")
    );
    expect(saves).toHaveLength(1);
    expect(screen.queryByRole("status")).toBeNull();
  });
  it("rejects unsafe links before offering save", () => {
    setup();
    fireEvent.change(screen.getByLabelText("トピックスのリンク先"), {
      target: { value: "javascript:alert(1)" },
    });
    preview();
    expect(screen.getByRole("alert").textContent).toContain("https");
    expect(screen.queryByRole("checkbox")).toBeNull();
  });
  it("uploads only on explicit request and does not publish on upload", async () => {
    const { saves, uploads } = setup();
    const file = new File(["fake"], "photo.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("メイン背景画像のファイル"), {
      target: { files: [file] },
    });
    expect(uploads).toHaveLength(0);
    preview();
    expect(screen.getByRole("alert").textContent).toContain(
      "アップロードするか"
    );
    fireEvent.click(
      screen.getByRole("button", { name: "メイン背景画像をアップロード" })
    );
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain(
        "まだ反映されません"
      )
    );
    expect(uploads).toHaveLength(1);
    expect(saves).toHaveLength(0);
    expect(
      (screen.getByLabelText("メイン背景画像") as HTMLInputElement).value
    ).toBe("https://example.com/upload.png");
  });
  it("reports failed uploads without changing the saved image URL", async () => {
    setup({ uploadError: "保存容量が不足しています" });
    fireEvent.change(screen.getByLabelText("メイン背景画像のファイル"), {
      target: {
        files: [new File(["fake"], "photo.png", { type: "image/png" })],
      },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "メイン背景画像をアップロード" })
    );
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("保存容量")
    );
    expect(
      (screen.getByLabelText("メイン背景画像") as HTMLInputElement).value
    ).toBe(homepageDefaults.heroImage);
  });
});
