"use client";

import { Button } from "@/components/ui/button";
import {
  ARTICLE_CATEGORIES,
  type ArticleCategoryFilter,
} from "../../../shared/utils/article-category";

export const OITA_CATEGORIES = ARTICLE_CATEGORIES;
export type OitaCategory = ArticleCategoryFilter;

interface BillCategoryFilterProps {
  selectedCategory: OitaCategory;
  onSelectCategory: (category: OitaCategory) => void;
}

export function BillCategoryFilter({
  selectedCategory,
  onSelectCategory,
}: BillCategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      {ARTICLE_CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <Button
            key={category}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectCategory(category)}
            className={`rounded-full text-xs font-semibold transition-all ${
              isSelected
                ? "bg-oita-pink text-white shadow-xs hover:bg-oita-pink/90"
                : "bg-white text-mirai-text hover:bg-oita-pink-light border-mirai-border"
            }`}
          >
            {category}
          </Button>
        );
      })}
    </div>
  );
}
