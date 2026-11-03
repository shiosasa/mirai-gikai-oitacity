import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OitaPhotoBackground } from "./oita-photo-background";

describe("OitaPhotoBackground", () => {
  it.each([
    "city-hall-wide",
    "river-koinobori",
    "wisteria-bridge",
    "shopping-arcade",
    "station-rooster-landscape",
    "sorin-statue-landscape",
    "yumeiro-performance",
  ] as const)("renders %s only as a subdued decorative background", (photo) => {
    const html = renderToStaticMarkup(<OitaPhotoBackground photo={photo} />);
    expect(html).toContain(encodeURIComponent(`/img/oita/${photo}.webp`));
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('alt=""');
    expect(html).toContain("pointer-events-none");
    expect(html).toContain('loading="lazy"');
  });

  it.each([
    "sorin-statue-landscape",
    "station-rooster-landscape",
  ] as const)("keeps the entire %s photo visible without cropping", (photo) => {
    const html = renderToStaticMarkup(<OitaPhotoBackground photo={photo} />);
    expect(html).toContain("object-contain object-right opacity-40");
    expect(html).not.toContain("object-cover");
  });

  it("fills the whole frame with the festival performance rather than a small sign", () => {
    const html = renderToStaticMarkup(
      <OitaPhotoBackground photo="yumeiro-performance" />
    );
    expect(html).toContain("object-cover object-center opacity-20");
    expect(html).toContain('class="absolute inset-0"');
    expect(html).toContain('sizes="(max-width: 1024px) 100vw, 1000px"');
    expect(html).not.toContain("w-2/3");
  });

  it("uses pink tokens for listing headers without changing the default TOP background", () => {
    const pink = renderToStaticMarkup(
      <OitaPhotoBackground photo="yumeiro-performance" tone="pink" />
    );
    expect(pink).toContain("from-oita-pink-light to-oita-pink-accent");
    expect(pink).toContain("from-oita-pink-light to-oita-pink-light/10");
    const original = renderToStaticMarkup(
      <OitaPhotoBackground photo="river-koinobori" />
    );
    expect(original).toContain("bg-white");
    expect(original).not.toContain("oita-pink");
  });

  it("keeps city hall whole and faint inside the mayor title frame", () => {
    const html = renderToStaticMarkup(
      <OitaPhotoBackground photo="city-hall-wide" tone="pink" />
    );
    expect(html).toContain("object-contain object-right opacity-20");
    expect(html).toContain("from-oita-pink-light to-oita-pink-accent");
  });

  it.each([
    "river-koinobori",
    "wisteria-bridge",
    "shopping-arcade",
  ] as const)("keeps scenery %s subdued", (photo) => {
    const html = renderToStaticMarkup(<OitaPhotoBackground photo={photo} />);
    expect(html).toContain("object-cover object-center opacity-20");
  });
});
