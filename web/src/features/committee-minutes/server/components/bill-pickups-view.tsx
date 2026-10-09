import "server-only";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BillPickupList } from "../../client/components/bill-pickup-list";
import type { BillPickup } from "../../shared/types/bill-pickup";

type Props = {
  pickups: BillPickup[];
};

export function BillPickupsView({ pickups }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          href="/committees"
          className="inline-flex items-center gap-1 text-sm text-mirai-text-muted hover:text-mirai-text"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          委員会・本会議一覧へ戻る
        </Link>
        <header className="flex flex-col gap-3 rounded-2xl bg-gradient-to-br from-mirai-gradient-start to-mirai-gradient-end px-6 py-6">
          <span className="w-fit rounded-full bg-bill-pickup-bg px-3 py-1 text-xs font-medium text-bill-pickup-text">
            議案一覧
          </span>
          <h1 className="text-xl font-bold leading-snug text-mirai-text sm:text-2xl">
            議案ピックアップ
          </h1>
          <p className="text-sm leading-relaxed text-mirai-text-secondary">
            本会議や委員会で取り上げられ、議案詳細ページが公開されている議案をまとめています。
          </p>
        </header>
      </div>

      {pickups.length === 0 ? (
        <p className="rounded-2xl border border-mirai-border bg-white p-5 text-sm text-mirai-text-muted">
          議案ピックアップは準備中です。
        </p>
      ) : (
        <BillPickupList pickups={pickups} />
      )}
    </div>
  );
}
