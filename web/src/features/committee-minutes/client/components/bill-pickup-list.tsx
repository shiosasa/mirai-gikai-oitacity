"use client";

import { ArrowRight, CalendarDays, FileText } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BillCategoryFilter,
  type OitaCategory,
} from "@/features/bills/client/components/bill-list/bill-category-filter";
import { BillTag } from "@/features/bills/client/components/bill-list/bill-tag";
import type { BillPickup } from "../../shared/types/bill-pickup";
import { filterBillPickupsByCategory } from "../../shared/utils/filter-bill-pickups-by-category";
import { formatJapaneseDate } from "../../shared/utils/format-japanese-date";

type Props = {
  pickups: BillPickup[];
};

export function BillPickupList({ pickups }: Props) {
  const [selectedCategory, setSelectedCategory] =
    useState<OitaCategory>("すべて");
  const filteredPickups = useMemo(
    () => filterBillPickupsByCategory(pickups, selectedCategory),
    [pickups, selectedCategory]
  );

  return (
    <div className="flex flex-col gap-4">
      <BillCategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      {filteredPickups.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-mirai-border bg-mirai-surface/50 p-6 text-center text-sm text-mirai-text-muted">
          「{selectedCategory}」に関する議案は見つかりませんでした。
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {filteredPickups.map((pickup) => (
            <li
              key={pickup.id}
              className="rounded-2xl border border-mirai-border bg-white p-5"
            >
              <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-bill-pickup-bg px-2.5 py-1 text-xs font-medium text-bill-pickup-text">
                <FileText className="h-3.5 w-3.5" />
                議案一覧
              </span>
              {pickup.bill_number && (
                <p className="mb-1 text-xs font-medium text-mirai-text-muted">
                  {pickup.bill_number}
                </p>
              )}
              {pickup.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {pickup.tags.map((tag) => (
                    <BillTag key={tag.id} tag={tag} />
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <h2 className="text-lg font-bold text-mirai-text">
                  <Link
                    href={`/bills/${pickup.id}`}
                    className="hover:text-primary hover:underline underline-offset-2"
                  >
                    {pickup.name}
                  </Link>
                </h2>
                <Link
                  href={`/bills/${pickup.id}`}
                  className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                >
                  議案詳細を見る
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-4 border-t border-mirai-border pt-3">
                <h3 className="text-xs font-semibold text-mirai-text-muted">
                  関連する会議
                </h3>
                <ul className="mt-2 flex flex-col gap-2">
                  {pickup.references.map((reference) => {
                    const prefix =
                      reference.meetingType === "本会議"
                        ? "/committees/plenary"
                        : "/committees/committee";
                    return (
                      <li key={`${reference.meetingId}-${reference.sessionId}`}>
                        <Link
                          href={`${prefix}/${reference.meetingId}/${reference.sessionId}`}
                          className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-primary-accent hover:underline"
                        >
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatJapaneseDate(reference.meetingDate)}
                          {reference.sessionTitle}
                          <span className="text-mirai-text-muted">
                            （{reference.meetingType}）
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
