// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generatePreviewUrl } from "../../server/actions/generate-preview-url";
import { PreviewButton } from "./preview-button";

vi.mock("../../server/actions/generate-preview-url", () => ({
  generatePreviewUrl: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PreviewButton", () => {
  let previewLocation: { href: string };
  let previewWindow: Window;

  beforeEach(() => {
    previewLocation = { href: "about:blank" };
    previewWindow = Object.create(window) as Window;
    Object.defineProperty(previewWindow, "location", {
      configurable: true,
      value: previewLocation,
    });
    Object.defineProperty(previewWindow, "opener", {
      configurable: true,
      writable: true,
      value: window,
    });
    Object.defineProperty(previewWindow, "close", {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(window, "open").mockReturnValue(previewWindow);
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("URL生成を待つ前に開いたタブへプレビューURLを設定する", async () => {
    let resolvePreviewUrl!: (
      result: Awaited<ReturnType<typeof generatePreviewUrl>>
    ) => void;
    vi.mocked(generatePreviewUrl).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePreviewUrl = resolve;
        })
    );

    render(<PreviewButton billId="bill-123" />);
    fireEvent.click(screen.getByRole("button", { name: "プレビュー" }));

    expect(window.open).toHaveBeenCalledWith("about:blank", "_blank");
    expect(previewLocation.href).toBe("about:blank");

    await act(async () => {
      resolvePreviewUrl({
        success: true,
        url: "https://mirai-gikai-oitacity-web.vercel.app/preview/bills/bill-123?token=preview-token",
      });
    });

    expect(previewLocation.href).toBe(
      "https://mirai-gikai-oitacity-web.vercel.app/preview/bills/bill-123?token=preview-token"
    );
    expect(previewWindow.opener).toBeNull();
  });

  it("ポップアップがブロックされた場合はURLを生成せず通知する", () => {
    vi.mocked(window.open).mockReturnValue(null);

    render(<PreviewButton billId="bill-123" />);
    fireEvent.click(screen.getByRole("button", { name: "プレビュー" }));

    expect(generatePreviewUrl).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(
      "プレビューを開けませんでした。ブラウザーのポップアップ設定をご確認ください"
    );
  });

  it("URL生成に失敗した場合は空のタブを閉じる", async () => {
    vi.mocked(generatePreviewUrl).mockResolvedValue({
      success: false,
      error: "プレビューURLの生成に失敗しました",
    });

    render(<PreviewButton billId="bill-123" />);
    fireEvent.click(screen.getByRole("button", { name: "プレビュー" }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(previewWindow.close).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(
      "プレビューURLの生成に失敗しました"
    );
  });
});
