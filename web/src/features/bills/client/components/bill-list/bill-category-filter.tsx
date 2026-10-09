"use client";

import { Button } from "@/components/ui/button";

export const OITA_CATEGORIES = [
  "すべて",
  "子育て・教育",
  "安心・安全・防災",
  "まちづくり・暮らし",
  "まちの仕組み・選挙",
] as const;

export type OitaCategory = (typeof OITA_CATEGORIES)[number];

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
      {OITA_CATEGORIES.map((category) => {
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
