// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MinutesPageNavigation } from "./minutes-page-navigation";

describe("MinutesPageNavigation", () => {
  it.each([
    ["/committees/plenary", "本会議の一覧へ戻る"],
    ["/committees/committee/5", "委員会の一覧へ戻る"],
  ])("links back to %s and to the top of this document", (href, label) => {
    const container = document.createElement("div");
    container.innerHTML = renderToStaticMarkup(
      <MinutesPageNavigation backHref={href} backLabel={label} />
    );
    expect(container.querySelector(`a[href="${href}"]`)?.textContent).toContain(
      label
    );
    expect(
      container.querySelector('a[href="#minutes-page-top"]')?.textContent
    ).toContain("ページ上部へ");
    expect(container.querySelector("nav")?.getAttribute("aria-label")).toBe(
      "議事録を読み終えた後の移動"
    );
  });
});
