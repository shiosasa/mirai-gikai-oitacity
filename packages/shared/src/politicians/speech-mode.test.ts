import { describe, expect, it } from "vitest";
import { getPoliticianSpeechMode } from "./speech-mode";

describe("getPoliticianSpeechMode", () => {
  it("disables the feature unless explicitly configured", () => {
    expect(getPoliticianSpeechMode({})).toBe("disabled");
    expect(getPoliticianSpeechMode({ POLITICIAN_SPEECH_MODE: "" })).toBe(
      "disabled"
    );
    expect(getPoliticianSpeechMode({ POLITICIAN_SPEECH_MODE: "database" })).toBe(
      "database"
    );
  });

  it("allows samples in local development and Vercel Preview only", () => {
    expect(
      getPoliticianSpeechMode({
        POLITICIAN_SPEECH_MODE: "preview",
        NODE_ENV: "development",
      })
    ).toBe("preview");
    expect(
      getPoliticianSpeechMode({
        POLITICIAN_SPEECH_MODE: "preview",
        NODE_ENV: "production",
        VERCEL: "1",
        VERCEL_ENV: "preview",
      })
    ).toBe("preview");
  });

  it.each([
    { NODE_ENV: "production" },
    { NODE_ENV: "test" },
    { NODE_ENV: "development", VERCEL: "1", VERCEL_ENV: "production" },
    { NODE_ENV: "production", VERCEL: "1", VERCEL_ENV: "production" },
    { NODE_ENV: "development", VERCEL_ENV: "preview" },
  ])("rejects sample mode outside approved preview environments: %o", (env) => {
    expect(() =>
      getPoliticianSpeechMode({ ...env, POLITICIAN_SPEECH_MODE: "preview" })
    ).toThrow();
  });

  it("rejects invalid configuration", () => {
    expect(() =>
      getPoliticianSpeechMode({ POLITICIAN_SPEECH_MODE: "enabled" })
    ).toThrow();
  });
});
