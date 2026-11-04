import { describe, expect, it } from "vitest";
import { DIFFICULTY_COOKIE_NAME } from "@/features/bill-difficulty/shared/types";

const baseUrl = process.env.BILL_PREVIEW_TEST_URL;

describe.skipIf(!baseUrl)("議案カードの下書きプレビュー", () => {
  const billId = process.env.BILL_PREVIEW_TEST_ID;
  const token = process.env.BILL_PREVIEW_TEST_TOKEN;

  function previewUrl(previewToken?: string) {
    if (!baseUrl || !billId || !token) {
      throw new Error(
        "BILL_PREVIEW_TEST_URL、BILL_PREVIEW_TEST_ID、BILL_PREVIEW_TEST_TOKEN が必要です"
      );
    }
    const url = new URL(`/preview/bills/${billId}`, baseUrl);
    if (previewToken) url.searchParams.set("token", previewToken);
    return url;
  }

  it("有効なトークンでは公開カードと同じレイアウトを表示する", async () => {
    const response = await fetch(previewUrl(token));
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html.includes("議案カードのプレビュー")).toBe(true);
    expect(html.includes("関連する議事録")).toBe(true);
    expect(html.includes("取り組みの詳細")).toBe(true);
    expect(html.includes("説明をもっと詳しく")).toBe(true);
    for (const heading of [
      "背景・理由",
      "重要ポイント",
      "主に影響を受ける人・対象者",
      "審議結果・出典",
    ]) {
      expect(html.includes(heading)).toBe(true);
    }
    expect(html.includes("この議案のポイントは？")).toBe(false);
    expect(html.includes("わからないことをAIに質問する")).toBe(false);
  });

  it("詳しいモードも同じカード表示で切り替えられる", async () => {
    const response = await fetch(previewUrl(token), {
      headers: { Cookie: `${DIFFICULTY_COOKIE_NAME}=hard` },
    });
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html.includes("議案カードのプレビュー")).toBe(true);
    expect(html.includes("取り組みの詳細")).toBe(true);
    expect(html.includes("詳しい説明は準備中です。")).toBe(false);
    expect(/role="switch"[^>]*aria-checked="true"/.test(html)).toBe(true);
  });

  it.each([
    undefined,
    "invalid-preview-token",
  ])("トークン %s では下書き本文を返さない", async (previewToken) => {
    const response = await fetch(previewUrl(previewToken));
    const html = await response.text();

    expect(html.includes("関連する議事録")).toBe(false);
    expect(html.includes("議案カードのプレビュー")).toBe(false);
    expect(html.includes("404")).toBe(true);
  });

  it("同じ下書きを公開カードのURLでは表示しない", async () => {
    previewUrl();
    const response = await fetch(
      new URL(`/committees/bill-pickups/${billId}`, baseUrl)
    );
    const html = await response.text();

    expect(html.includes("関連する議事録")).toBe(false);
    expect(html.includes("404")).toBe(true);
  });
});
