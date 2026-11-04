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
      <ArticleCategoryFilter articles={articles} />
    </section>
  );
}
