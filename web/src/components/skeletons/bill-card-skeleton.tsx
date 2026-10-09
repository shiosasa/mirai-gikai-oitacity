export function BillCardSkeleton() {
  return (
    <div className="w-full rounded-lg border border-mirai-border bg-white p-4 sm:p-6">
      <div className="flex flex-col gap-4">
        {/* ヘッダー部分 */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>

        {/* タグ部分 */}
        <div className="flex flex-wrap gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
        </div>

        {/* フッター部分 */}
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  );
}
