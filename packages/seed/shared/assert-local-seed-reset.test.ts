import { describe, expect, it } from "vitest";
import { assertLocalSeedResetAllowed } from "./assert-local-seed-reset";

describe("assertLocalSeedResetAllowed", () => {
  it("明示確認のあるローカルURLのみ許可する", () => {
    expect(() =>
      assertLocalSeedResetAllowed("http://127.0.0.1:54321", "true")
    ).not.toThrow();
  });

  it("明示確認がない場合は停止する", () => {
    expect(() =>
      assertLocalSeedResetAllowed("http://127.0.0.1:54321", undefined)
    ).toThrow(/ALLOW_DESTRUCTIVE_SEED_RESET/);
  });

  it("リモートSupabase URLは拒否する", () => {
    expect(() =>
      assertLocalSeedResetAllowed("https://example.supabase.co", "true")
    ).toThrow(/ローカルSupabase専用/);
  });
});