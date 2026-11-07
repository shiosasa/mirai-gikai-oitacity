import { describe, expect, it } from "vitest";
import { resolveWebUrl } from "./resolve-web-url";

describe("resolveWebUrl", () => {
  it("ローカル開発では既定のlocalhostを使う", () => {
    expect(resolveWebUrl(undefined, false)).toBe("http://localhost:3000");
  });

  it("ローカル開発で指定されたURLを使う", () => {
    expect(resolveWebUrl("http://localhost:4000", false)).toBe(
      "http://localhost:4000"
    );
  });

  it("VercelでURL未設定なら公開WebのURLを使う", () => {
    expect(resolveWebUrl(undefined, true)).toBe(
      "https://mirai-gikai-oitacity-web.vercel.app"
    );
  });

  it("Vercelでlocalhostが指定されても公開WebのURLに置き換える", () => {
    expect(resolveWebUrl("http://localhost:3000", true)).toBe(
      "https://mirai-gikai-oitacity-web.vercel.app"
    );
  });

  it("Vercelで指定された公開WebのURLを使う", () => {
    expect(resolveWebUrl("https://preview.example.com", true)).toBe(
      "https://preview.example.com"
    );
  });
});
