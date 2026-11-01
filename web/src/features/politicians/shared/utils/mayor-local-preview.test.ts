import { describe, expect, it } from "vitest";
import { isMayorLocalPreviewEnabled } from "./mayor-local-preview";

describe("isMayorLocalPreviewEnabled", () => {
  it("requires an explicit local development opt-in", () => {
    expect(
      isMayorLocalPreviewEnabled({
        NODE_ENV: "development",
        MAYOR_LOCAL_DRAFT_PREVIEW: "1",
      })
    ).toBe(true);
    expect(isMayorLocalPreviewEnabled({ NODE_ENV: "development" })).toBe(false);
  });

  it.each([
    { NODE_ENV: "production" },
    { NODE_ENV: "test" },
    { NODE_ENV: "development", VERCEL: "1" },
    { NODE_ENV: "development", VERCEL_ENV: "preview" },
    { NODE_ENV: "development", VERCEL_ENV: "production" },
  ])("never exposes drafts in production or Vercel: %o", (env) => {
    expect(
      isMayorLocalPreviewEnabled({
        ...env,
        MAYOR_LOCAL_DRAFT_PREVIEW: "1",
      })
    ).toBe(false);
  });
});
