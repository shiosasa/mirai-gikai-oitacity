"use client";

import { ArrowLeft, CalendarDays, Link2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BillPickupItem } from "../../shared/utils/build-bill-pickup-items";
import {
  filterBillPickupItems,
  formatBillPickupNumber,
  getBillPickupHeading,
} from "../../shared/utils/build-bill-pickup-items";

type Props = {
  items: BillPickupItem[];
  detailMode?: boolean;
};

function formatDate(date: string): string {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatUpdatedDate(date: string): string {
  return new Date(date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getCategoryTagClass(category: string): string {
  switch (category) {
    case "子育て・教育":
      return "border-pink-200 bg-pink-50 text-pink-800";
    case "安心・安全・防災":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "まちづくり・暮らし":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "まちの仕組み・選挙":
      return "border-violet-200 bg-violet-50 text-violet-800";
    default:
      return "border-mirai-border bg-mirai-surface-grouped text-mirai-text";
  }
}

function getSessionHref(
  meetingType: string,
  meetingId: number,
  sessionId: number
): string {
  const meetingPath = meetingType === "委員会" ? "committee" : "plenary";
  return `/committees/${meetingPath}/${meetingId}/${sessionId}`;
}

export function BillPickupsView({ items, detailMode = false }: Props) {
  const [activeCategory, setActiveCategory] = useState("すべて");
  const categories = [
    "子育て・教育",
    "安心・安全・防災",
    "まちづくり・暮らし",
    "まちの仕組み・選挙",
  ];
  const filteredItems = filterBillPickupItems(items, activeCategory);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={detailMode ? "/committees/bill-pickups" : "/committees"}
        className="inline-flex items-center gap-1 text-sm text-mirai-text-muted hover:text-mirai-text"
      >
        <ArrowLeft className="size-3.5" />
        {detailMode ? "議案一覧へ戻る" : "本会議・委員会一覧へ戻る"}
      </Link>

      <header className="rounded-2xl bg-gradient-to-br from-mirai-gradient-start to-mirai-gradient-end px-6 py-6">
        <p className="text-xs font-medium text-primary-accent">ピックアップ</p>
        <h1 className="mt-2 text-xl font-bold text-mirai-text sm:text-2xl">
          {detailMode ? "議案詳細" : "議案一覧"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-mirai-text-secondary">
          本会議・委員会の議事録で取り上げられた議案を随時更新しています。
        </p>
      </header>

      {!detailMode && (
        <p className="text-sm text-mirai-text-muted">{items.length}件の議案</p>
      )}

      {items.length === 0 ? (
        <p className="rounded-xl border border-mirai-border bg-white p-6 text-sm text-mirai-text-muted">
          議案はありません。
        </p>
      ) : (
        <>
          {!detailMode && (
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="カテゴリ"
            >
              {["すべて", ...categories].map((category) => (
                <Button
                  key={category}
                  type="button"
                  variant="ghost"
                  aria-pressed={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                  className={`h-auto rounded-full border px-4 py-2 text-sm font-semibold ${
                    category === "すべて"
                      ? activeCategory === category
                        ? "border-primary/30 bg-mirai-gradient text-mirai-text hover:bg-mirai-gradient"
                        : "border-mirai-border bg-white text-mirai-text-muted hover:bg-mirai-surface-muted"
                      : `${getCategoryTagClass(category)} ${
                          activeCategory === category
                            ? "shadow-sm ring-1 ring-current/20"
                            : "opacity-75 hover:opacity-100"
                        }`
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}

          {filteredItems.length === 0 ? (
            <p className="rounded-xl border border-mirai-border bg-white p-6 text-sm text-mirai-text-muted">
              このカテゴリの議案はありません。
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {filteredItems.map((item) => {
                const firstReference = item.references[0];
                return (
                  <li
                    key={item.billId}
                    className="overflow-hidden rounded-2xl border border-mirai-border bg-white shadow-sm"
                  >
                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-accent">
                          {item.kind}
                        </span>
                        {formatBillPickupNumber(
                          firstReference.billNumber,
                          firstReference.date
                        ) && (
                          <p className="text-sm text-mirai-text-muted">
                            {formatBillPickupNumber(
                              firstReference.billNumber,
                              firstReference.date
                            )}
                          </p>
                        )}
                      </div>
                      <h2 className="mt-2 text-xl font-bold leading-snug text-mirai-text group-hover:text-primary-accent">
                        {getBillPickupHeading(
                          firstReference.billName,
                          item.description,
                          item.relatedTopicTitles
                        )}
                      </h2>
                      {getBillPickupHeading(
                        firstReference.billName,
                        item.description,
                        item.relatedTopicTitles
                      ) !== firstReference.billName && (
                        <p className="mt-1 text-xs text-mirai-text-muted">
                          正式名称：{firstReference.billName}
                        </p>
                      )}
                      {item.categories.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.categories.map((category) => (
                            <span
                              key={category}
                              className={`rounded-full border px-3 py-1 text-xs font-medium ${getCategoryTagClass(category)}`}
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.description && (
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-mirai-text-secondary">
                          {item.description}
                        </p>
                      )}
                      {item.updatedAt && (
                        <p className="mt-3 text-xs text-mirai-text-muted">
                          更新日：{formatUpdatedDate(item.updatedAt)}
                        </p>
                      )}
                      <p className="mt-3 text-xs text-mirai-text-muted">
                        関連する議事録 {item.references.length}件
                      </p>
                      {!detailMode && (
                        <Link
                          href={`/committees/bill-pickups/${item.billId}`}
                          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary-accent"
                        >
                          詳細ページを見る
                          <Link2 aria-hidden="true" className="size-3.5" />
                        </Link>
                      )}
                    </div>

                    <ul className="space-y-2 border-t border-mirai-border px-6 py-4">
                      {item.references.map((reference) => (
                        <li
                          key={`${reference.meetingId}-${reference.sessionId}-${reference.billNumber}-${reference.billName}`}
                        >
                          <Link
                            href={getSessionHref(
                              reference.meetingType,
                              reference.meetingId,
                              reference.sessionId
                            )}
                            className="inline-flex flex-wrap items-center gap-1.5 text-sm text-primary-accent hover:underline"
                          >
                            <CalendarDays
                              aria-hidden="true"
                              className="size-4"
                            />
                            <span>{reference.meetingTitle}</span>
                            {reference.date && (
                              <span>（{formatDate(reference.date)}）</span>
                            )}
                            {reference.billNumber && (
                              <span>{reference.billNumber}</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
