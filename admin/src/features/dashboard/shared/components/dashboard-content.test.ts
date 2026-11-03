// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { NavigationMenu } from "@/app/(protected)/layout/navigation-links";
import { DashboardContent } from "./dashboard-content";

afterEach(cleanup);

describe("管理画面の導線", () => {
  it("よく更新する8機能へ移動でき、公開の注意を表示する", () => {
    render(createElement(DashboardContent));
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/minutes",
      "/bills",
      "/topics",
      "/press-conferences",
      "/mayor-proposals",
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
