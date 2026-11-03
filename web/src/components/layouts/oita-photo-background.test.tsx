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
  ] as const)("renders %s only as a subdued decorative background", (photo) => {
    const html = renderToStaticMarkup(<OitaPhotoBackground photo={photo} />);
    expect(html).toContain(encodeURIComponent(`/img/oita/${photo}.webp`));
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('alt=""');
    expect(html).toContain("pointer-events-none");
    expect(html).toContain("opacity-20");
    expect(html).toContain('loading="lazy"');
  });
});
