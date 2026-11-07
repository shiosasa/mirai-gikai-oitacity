import { describe, expect, it } from "vitest";
import { homepageImageLimit, validateHomepageImage } from "./image-file";

describe("homepage image validation", () => {
  it.each([
    ["image/png", [137, 80, 78, 71, 13, 10, 26, 10], "png"],
    ["image/jpeg", [255, 216, 255, 224], "jpg"],
    ["image/gif", [..."GIF89a"].map((char) => char.charCodeAt(0)), "gif"],
    [
      "image/webp",
      [..."RIFF1234WEBP"].map((char) => char.charCodeAt(0)),
      "webp",
    ],
  ] as const)("recognizes %s by MIME and signature", (mime, bytes, extension) => {
    expect(validateHomepageImage(new Uint8Array(bytes), mime)).toBe(extension);
  });
  it("rejects empty, oversized, mismatched and executable images", () => {
    for (const [mime, bytes] of [
      ["image/png", new Uint8Array()],
      ["image/png", new Uint8Array(homepageImageLimit + 1)],
      ["image/jpeg", new Uint8Array([137, 80, 78, 71])],
      ["image/svg+xml", new TextEncoder().encode("<svg onload='alert(1)'/>")],
      ["image/png", new TextEncoder().encode("<html>not an image</html>")],
    ] as const) {
      expect(() => validateHomepageImage(bytes, mime)).toThrow();
    }
  });
  it("accepts exactly 5MB and rejects a byte more", () => {
    const bytes = new Uint8Array(homepageImageLimit);
    bytes.set([255, 216, 255]);
    expect(validateHomepageImage(bytes, "image/jpeg")).toBe("jpg");
    const oversized = new Uint8Array(homepageImageLimit + 1);
    oversized.set(bytes);
    expect(() => validateHomepageImage(oversized, "image/jpeg")).toThrow("5MB");
  });
});
