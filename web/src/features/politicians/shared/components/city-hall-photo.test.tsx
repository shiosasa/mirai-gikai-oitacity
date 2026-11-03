import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CityHallPhoto } from "./city-hall-photo";

describe("CityHallPhoto", () => {
  it("shows a small standalone city hall photo with accessible description and caption", () => {
    const html = renderToStaticMarkup(<CityHallPhoto />);
    expect(html).toContain("<figure");
    expect(html).toContain("<figcaption");
    expect(html).toContain("大分市役所");
    expect(html).toContain('alt="青空の下に立つ大分市役所の庁舎"');
    expect(html).toContain(encodeURIComponent("/img/oita/city-hall.webp"));
    expect(html).toContain("mt-12 w-24");
    expect(html).toContain('sizes="96px"');
    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain("aria-hidden");
  });
});
