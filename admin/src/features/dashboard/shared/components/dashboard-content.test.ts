// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { NavigationMenu } from "@/app/(protected)/layout/navigation-links";
import { DashboardContent } from "./dashboard-content";
import { ManualUpdateGuide } from "./manual-update-guide";

afterEach(cleanup);

describe("管理画面の導線", () => {
  it("AI不要の更新先と未対応項目を区別して案内する", () => {
    render(createElement(ManualUpdateGuide));
    expect(screen.getAllByRole("link")).toHaveLength(11);
    expect(
      screen
        .getByRole("link", { name: "市長プロフィール" })
        .getAttribute("href")
    ).toBe("/mayor-profile");
    expect(
      screen.getByRole("link", { name: "議員紹介" }).getAttribute("href")
    ).toBe("/politicians");
    expect(screen.getByText(/議員IDと発言の紐づけは維持/)).toBeTruthy();
    expect(
      screen.getByText(/文章の手入力・保存・公開にはAIトークンを使用しません/)
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", {
        name: "まだ管理画面だけでは完結しないもの",
      })
    ).toBeTruthy();
    expect(screen.getByText(/関連リンクは表示名とURLを複数登録/)).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "交代と任期履歴" }).getAttribute("href")
    ).toBe("/office-history");
    expect(screen.getByText(/導入前の全任期の復元/)).toBeTruthy();
  });
  it("手動更新ガイドとよく更新する10機能へ移動でき、公開の注意を表示する", () => {
    render(createElement(DashboardContent));
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/update-guide",
      "/minutes",
      "/bills",
      "/topics",
      "/press-conferences",
      "/mayor-proposals",
      "/office-history",
      "/mayor-profile",
      "/politician-speeches",
      "/information",
      "/topic-voices",
    ]);
    expect(screen.getByText(/下書き状態がありません/)).toBeTruthy();
  });
  it("深い編集ページでも現在地を示し、モバイルのリンク選択で閉じる", () => {
    const { container } = render(
      createElement(NavigationMenu, { pathname: "/minutes/10/sessions/20" })
    );
    const links = screen.getAllByRole("link", { name: "議事録要約" });
    expect(links[0].getAttribute("aria-current")).toBe("page");
    const mobile = container.querySelector("details");
    if (!mobile) throw new Error("モバイルメニューがありません");
    mobile.open = true;
    const mobileLink =
      mobile.querySelector<HTMLAnchorElement>('a[href="/minutes"]');
    if (!mobileLink) throw new Error("議事録リンクがありません");
    // Keep this test local; only the menu-close behavior is under test.
    mobileLink.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(mobileLink);
    expect(mobile.open).toBe(false);
  });
});
