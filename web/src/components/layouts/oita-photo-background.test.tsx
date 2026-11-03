import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OitaPhotoBackground } from "./oita-photo-background";

describe("OitaPhotoBackground", () => {
  it.each([
    "river-koinobori",
    "wisteria-bridge",
    "shopping-arcade",
    "station-rooster",
    "sorin-statue",
    "yumeiro-festival",
  ] as const)("renders %s only as a subdued decorative background", (photo) => {
    const html = renderToStaticMarkup(<OitaPhotoBackground photo={photo} />);
    expect(html).toContain(encodeURIComponent(`/img/oita/${photo}.webp`));
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('alt=""');
    expect(html).toContain("pointer-events-none");
    expect(html).toContain('loading="lazy"');
  });

  it.each([
    "sorin-statue",
    "station-rooster",
    "yumeiro-festival",
  ] as const)("keeps the entire %s photo visible without cropping", (photo) => {
    const html = renderToStaticMarkup(<OitaPhotoBackground photo={photo} />);
    expect(html).toContain("object-contain object-right opacity-40");
    expect(html).not.toContain("object-cover");
  });

  it("uses pink tokens for listing headers without changing the default TOP background", () => {
    const pink = renderToStaticMarkup(
      <OitaPhotoBackground photo="yumeiro-festival" tone="pink" />
    );
    expect(pink).toContain("from-oita-pink-light to-oita-pink-accent");
    expect(pink).toContain("from-oita-pink-light to-oita-pink-light/10");
    const original = renderToStaticMarkup(
      <OitaPhotoBackground photo="river-koinobori" />
    );
    expect(original).toContain("bg-white");
    expect(original).not.toContain("oita-pink");
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
