import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OitaPhotoBackground } from "./oita-photo-background";

describe("OitaPhotoBackground", () => {
  it.each([
    "city-hall-wide",
    "river-koinobori",
    "wisteria-bridge",
    "shopping-arcade-tree",
    "station-rooster-landscape",
    "sorin-statue-banner",
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
    "station-rooster-landscape",
  ] as const)("keeps the entire %s photo visible without cropping", (photo) => {
    const html = renderToStaticMarkup(<OitaPhotoBackground photo={photo} />);
    expect(html).toContain("object-contain object-right opacity-40");
    expect(html).not.toContain("object-cover");
  });

  it("fills the Sorin frame on mobile and its right half on desktop", () => {
    const html = renderToStaticMarkup(
      <OitaPhotoBackground photo="sorin-statue-banner" tone="pink" />
    );
    expect(html).toContain("absolute inset-y-0 right-0 w-full sm:w-1/2");
    expect(html).toContain("object-cover object-right-top opacity-40");
    expect(html).not.toContain("object-contain");
    expect(html).not.toContain("w-2/3");
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

  it("fills the mayor frame on mobile and keeps city hall whole on desktop", () => {
    const html = renderToStaticMarkup(
      <OitaPhotoBackground photo="city-hall-wide" tone="pink" />
    );
    expect(html).toContain(
      "object-cover object-center opacity-20 sm:object-contain sm:object-right"
    );
    expect(html).toContain("from-oita-pink-light to-oita-pink-accent");
  });

  it("centers the Christmas tree on mobile and avoids cropping on desktop", () => {
    const html = renderToStaticMarkup(
      <OitaPhotoBackground photo="shopping-arcade-tree" tone="pink" />
    );
    expect(html).toContain(
      encodeURIComponent("/img/oita/shopping-arcade-tree.webp")
    );
    expect(html).toContain(
      "object-cover object-center opacity-20 sm:object-contain sm:object-right"
    );
    expect(html).toContain("from-oita-pink-light to-oita-pink-accent");
  });

  it.each([
    "city-hall-wide",
    "wisteria-bridge",
    "shopping-arcade-tree",
    "station-rooster-landscape",
    "sorin-statue-banner",
  ] as const)("fills the pink %s title frame on mobile only", (photo) => {
    const html = renderToStaticMarkup(
      <OitaPhotoBackground photo={photo} tone="pink" />
    );
    expect(html).toContain("absolute inset-y-0 right-0 w-full sm:w-1/2");
    expect(html).toContain("(max-width: 639px) 100vw");
    expect(html).toContain("object-cover");
    expect(html).toContain("from-oita-pink-light");
  });

  it.each([
    "river-koinobori",
    "wisteria-bridge",
  ] as const)("keeps scenery %s subdued", (photo) => {
    const html = renderToStaticMarkup(<OitaPhotoBackground photo={photo} />);
    expect(html).toContain("object-cover object-center opacity-20");
  });
});
