"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BillArticle } from "../../../shared/types";
import {
  ARTICLE_CATEGORIES,
  type ArticleCategoryFilter as ArticleCategoryValue,
  filterArticlesByCategory,
} from "../../../shared/utils/article-category";
import { ArticleAccordionCard } from "./article-accordion-card";

interface ArticleCategoryFilterProps {
  articles: BillArticle[];
}

export function ArticleCategoryFilter({
  articles,
}: ArticleCategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<ArticleCategoryValue>("すべて");
  const filteredArticles = filterArticlesByCategory(articles, selectedCategory);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 py-2">
        {ARTICLE_CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <Button
              key={category}
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={isSelected}
              onClick={() => setSelectedCategory(category)}
              className={`h-auto min-h-9 whitespace-normal rounded-md px-3 py-2 text-sm font-medium ${
                isSelected
                  ? "border-oita-pink bg-oita-pink-light text-mirai-text"
                  : "border-mirai-border bg-white text-mirai-text hover:bg-mirai-surface"
              }`}
            >
              {category}
            </Button>
          );
        })}
      </div>
      {filteredArticles.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredArticles.map((article) => (
            <ArticleAccordionCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-mirai-text-secondary">
          このカテゴリの記事はありません
        </p>
      )}
    </div>
  );
}
