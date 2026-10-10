import { ArticleCategoryFilter } from "../../client/components/articles/article-category-filter";
import type { BillArticle } from "../../shared/types";

interface ArticlesSectionProps {
  articles: BillArticle[];
}

export function ArticlesSection({ articles }: ArticlesSectionProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6">
      {/* セクションヘッダー */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[22px] font-bold text-mirai-text leading-[1.48]">
          トピックス📰
        </h2>
        <p className="text-xs font-medium text-mirai-text-secondary leading-[1.67]">
          大分市議会で話し合われている政策や課題を、わかりやすく翻訳した記事です
        </p>
      </div>

      <ArticleCategoryFilter articles={articles} />
    </section>
  );
}
