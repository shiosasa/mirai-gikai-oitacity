import type { BillArticle } from "../../shared/types";
import { ArticleAccordionCard } from "../../client/components/articles/article-accordion-card";

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

      {/* 記事アコーディオン一覧 */}
      <div className="flex flex-col gap-4">
        {articles.map((article) => (
          <ArticleAccordionCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
