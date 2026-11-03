import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OitaCityIntroduction } from "./oita-city-introduction";

describe("OitaCityIntroduction", () => {
  it("introduces the city, its flower and tree, sightseeing and food", () => {
    const html = renderToStaticMarkup(<OitaCityIntroduction />);
    for (const text of [
      "大分市って、どんなまち？",
      "市の花・さざんか",
      "市の木・ホルトノキ",
      "1973年",
      "高崎山自然動物園",
      "うみたまご",
      "府内城",
      "関あじ・関さば",
    ]) {
      expect(html).toContain(text);
    }
    expect(html).toContain('aria-labelledby="oita-city-heading"');
    expect(html).toContain('id="oita-city-heading"');
    expect(html).toContain('src="/illustrations/sazanka.svg"');
    expect(html).toContain(
      encodeURIComponent("/img/oita/yumeiro-festival.webp")
    );
    expect(html).not.toContain(
      encodeURIComponent("/img/oita/wisteria-bridge.webp")
    );
  });
  it("links to source information and advises checking current visitor information", () => {
    const html = renderToStaticMarkup(<OitaCityIntroduction />);
    for (const url of [
      "https://www.city.oita.oita.jp/o001/shisejoho/annai/1118199188920.html",
      "https://www.city.oita.oita.jp/o001/shisejoho/annai/1118206495123.html",
      "https://www.city.oita.oita.jp/o029/shisejoho/annai/1269431035754.html",
      "https://www.oishiimati-oita.jp/",
    ]) {
      expect(html).toContain(`href="${url}"`);
    }
    expect(html).toContain("各施設の最新情報をご確認ください");
  });
});
