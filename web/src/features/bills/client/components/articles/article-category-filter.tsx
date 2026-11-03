"use client";

import { useState } from "react";
import { OitaPhotoBackground } from "@/components/layouts/oita-photo-background";
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
      <header className="relative isolate overflow-hidden rounded-2xl p-5">
        <OitaPhotoBackground photo="station-rooster-landscape" tone="pink" />
        <h2 className="text-[22px] font-bold text-mirai-text leading-[1.48]">
          トピックス📰
        </h2>
        <p className="mt-1.5 text-xs font-medium text-mirai-text-secondary leading-[1.67]">
          大分市議会で話し合われている政策や課題を、わかりやすく翻訳した記事です
        </p>
        <div
          role="group"
          aria-label="トピックスのカテゴリ"
          className="mt-4 flex flex-wrap items-center gap-2"
        >
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
      </header>
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
