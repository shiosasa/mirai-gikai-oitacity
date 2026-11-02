import { describe, expect, it } from "vitest";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { ARTICLE_CACHE_TAGS } from "./article-cache-tags";

describe("ARTICLE_CACHE_TAGS", () => {
  it("記事更新とインタビューの公開設定変更の両方でキャッシュを破棄する", () => {
    expect(ARTICLE_CACHE_TAGS).toEqual([
      CACHE_TAGS.BILLS,
      CACHE_TAGS.PUBLIC_INTERVIEW_REPORTS,
    ]);
  });
});
