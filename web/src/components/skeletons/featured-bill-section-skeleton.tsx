import { BillCardSkeleton } from "./bill-card-skeleton";

export function FeaturedBillSectionSkeleton() {
  return (
    <section className="flex flex-col gap-6">
      {/* セクションヘッダー */}
      <div className="flex flex-col gap-1.5">
        <div className="h-7 bg-gray-200 rounded w-48"></div>
        <div className="h-4 bg-gray-200 rounded w-96"></div>
      </div>

      {/* 注目の議案カード */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: 固定数のスケルトンで順序が変わらない
          <BillCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
