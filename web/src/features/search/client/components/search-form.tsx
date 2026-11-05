import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ARTICLE_CATEGORIES,
  type ArticleCategoryFilter,
} from "@/features/bills/shared/utils/article-category";

export function SearchForm({
  query,
  category,
}: {
  query: string;
  category: ArticleCategoryFilter;
}) {
  return (
    <form action="/search" method="get" role="search">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-mirai-text-muted"
          />
          <Input
            type="search"
            name="q"
            aria-label="検索キーワード"
            defaultValue={query}
            placeholder="キーワードを入力..."
            className="pl-9 h-11 text-base bg-white border-mirai-border"
          />
        </div>
        <Button type="submit" name="category" value={category} className="h-11">
          検索
        </Button>
      </div>
      <div
        className="flex flex-wrap gap-2 mt-3"
        role="group"
        aria-label="検索カテゴリ"
      >
        {ARTICLE_CATEGORIES.map((item) => (
          <Button
            key={item}
            type="submit"
            name="category"
            value={item}
            variant="ghost"
            size="sm"
            aria-pressed={category === item}
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
        キーワードを入力して「検索」またはEnterキーで検索できます。
        カテゴリを押すと、入力中のキーワードと組み合わせてトピックスを絞り込みます。
      </p>
    </form>
  );
}
