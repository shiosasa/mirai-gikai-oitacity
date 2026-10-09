"use client";

import { useState } from "react";
import type { BillWithContent } from "../../../shared/types";
import { BillCard } from "./bill-card";
import { BillCategoryFilter, type OitaCategory } from "./bill-category-filter";

interface BillListProps {
  bills: BillWithContent[];
  onOpenAiModal?: (bill: BillWithContent) => void;
}

export function BillList({ bills, onOpenAiModal }: BillListProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<OitaCategory>("すべて");

  const filteredBills = bills.filter((bill) => {
    if (selectedCategory === "すべて") return true;
    return bill.tags?.some((tag) => tag.label === selectedCategory);
  });

  return (
    <div className="space-y-4">
      <BillCategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {filteredBills.length === 0 ? (
        <div className="text-center py-12 bg-mirai-surface/50 rounded-2xl border border-dashed border-mirai-border">
          <p className="text-sm text-mirai-text-muted">
            「{selectedCategory}」に関する議案は見つかりませんでした。
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredBills.map((bill) => (
            <BillCard key={bill.id} bill={bill} onOpenAiModal={onOpenAiModal} />
          ))}
        </div>
      )}
    </div>
  );
}
