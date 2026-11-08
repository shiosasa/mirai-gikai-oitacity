import {
  homepageDefaults,
  homepageKeys,
} from "@mirai-gikai/shared/homepage/content";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { About } from "@/components/top/about";
import { Hero } from "@/components/top/hero";
import { OitaCityIntroduction } from "@/components/top/oita-city-introduction";
import { HomeCouncilHeading, HomeGuideBanner } from "./home-guide-banner";

describe("editable homepage rendering", () => {
  it("uses every editable field on its intended public surface", () => {
    for (const key of homepageKeys) {
      const marker = `homepage-test-${key}`;
      const value =
        key.endsWith("Url") || key.endsWith("Image")
          ? `https://example.com/${marker}.png`
          : marker;
      const content = { ...homepageDefaults, [key]: value };
      const html = renderToStaticMarkup(
        <>
          <Hero content={content} />
          <HomeCouncilHeading content={content} />
          {(["questions", "topics", "committees", "politicians"] as const).map(
            (kind) => (
              <HomeGuideBanner
                key={kind}
                kind={kind}
                content={content}
                sessionSlug="r8"
              />
            )
          )}
          <OitaCityIntroduction content={content} />
          <About content={content} />
        </>
      );
      expect(html, key).toContain(marker);
    }
  });
  it("keeps policies and visitor notices unchanged when ordinary copy changes", () => {
    const content = {
      ...homepageDefaults,
      aboutDescription: "新しい紹介文",
      cityDescription: "新しい市の紹介文",
    };
    const html = renderToStaticMarkup(
      <>
        <About content={content} />
        <OitaCityIntroduction content={content} />
      </>
    );
    expect(html).toContain("新しい紹介文");
    expect(html).toContain(
      "本サイトは政党チームみらいや大分市議会が運営しているものではありません"
    );
    expect(html).toContain(
      "みらいぎかいっちの目的とポリシー（押したら見れるで！）"
    );
    expect(html).toContain("https://mirai-gikai-portal.vercel.app/");
    expect(html).toContain("AIを使って情報を整理しています");
    expect(html).toContain("各施設の最新情報をご確認ください");
  });
  it("retains latest-session links and safely renders text rather than HTML", () => {
    const html = renderToStaticMarkup(
      <HomeGuideBanner
        kind="questions"
        content={{
          ...homepageDefaults,
          questionsTitle: "<script>alert(1)</script>",
        }}
        sessionSlug="r8"
      />
    );
    expect(html).toContain('href="/sessions/r8/questions"');
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});
