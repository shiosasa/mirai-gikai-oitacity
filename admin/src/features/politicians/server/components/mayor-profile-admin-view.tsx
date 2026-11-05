import "server-only";
import Link from "next/link";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { MayorProfileFormClient } from "../../client/components/mayor-profile-form-client";
import { findCurrentMayorForAdmin } from "../repositories/mayor-profile-repository";

export async function MayorProfileAdminView() {
  await requireAdmin();
  const mayor = await findCurrentMayorForAdmin();
  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold">市長プロフィールの管理</h1>
        <p>
          現在公開中の市長の氏名・写真・経歴・公式リンクを編集します。AIは使用しません。
        </p>
        <p className="text-sm text-muted-foreground">
          下書き・非公開機能はありません。保存すると「市長・議員紹介」の一覧と市長詳細に反映されます。公式資料を確認してから保存してください。空欄の任意項目は表示されなくなります。
        </p>
        <p className="text-sm text-muted-foreground">
          生年月日は和暦・西暦を使用できます。年齢は自動計算です。この画面では市長の交代・現職の切替・退任日・別の市長の登録は行いません。複数人で同時編集せず、最新の画面から更新してください。
        </p>
      </header>
      <nav
        aria-label="市長関連の別の更新先"
        className="flex flex-wrap gap-4 text-sm"
      >
        <Link href="/mayor-proposals" className="underline">
          市長提案理由を管理
        </Link>
        <Link href="/press-conferences" className="underline">
          記者会見を管理
        </Link>
        <Link href="/update-guide" className="underline">
          手動更新ガイド
        </Link>
      </nav>
      <p className="text-sm text-muted-foreground">
        提案理由は本会議、記者会見は会見ごとの別データです。プロフィールの保存では本文・公開状態・公開日・NEWを変更しません。
      </p>
      <MayorProfileFormClient initial={mayor} />
    </div>
  );
}
