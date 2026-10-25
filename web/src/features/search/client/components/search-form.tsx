"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ARTICLE_CATEGORIES } from "@/features/bills/shared/utils/article-category";
import {
  buildSearchUrl,
  parseSearchCategory,
} from "../../shared/utils/search-category";

export function SearchForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";
  const category = parseSearchCategory(
    searchParams.get("category") ?? undefined
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q") as string;
    const trimmed = q.trim();
    router.push(buildSearchUrl(trimmed, category));
  }

  return (
    <div>
      <form key={query} onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-mirai-text-muted" />
        <Input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="キーワードを入力..."
          className="pl-9 h-11 text-base bg-white border-mirai-border"
          autoFocus
        />
      </form>
      <div
        className="flex flex-wrap gap-2 mt-3"
        role="group"
        aria-label="検索カテゴリ"
      >
        {ARTICLE_CATEGORIES.map((item) => (
          <Button
            key={item}
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={category === item}
            onClick={() => router.push(buildSearchUrl(query, item))}
            className={`px-3 py-1 text-xs border rounded-full transition-colors ${
              category === item
                ? "border-mirai-text bg-mirai-text text-white hover:bg-mirai-text hover:text-white"
                : "border-mirai-border text-mirai-text-secondary hover:bg-mirai-surface"
            }`}
          >
            {item}
          </Button>
        ))}
      </div>
      <p className="mt-2 text-xs text-mirai-text-muted">
        カテゴリを選ぶとトピックスを絞り込みます。キーワードと組み合わせて検索できます。
      </p>
    </div>
  );
}
