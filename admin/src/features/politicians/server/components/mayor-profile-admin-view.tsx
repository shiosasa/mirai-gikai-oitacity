import "server-only";
import Link from "next/link";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { MayorProfileFormClient } from "../../client/components/mayor-profile-form-client";
import {
  findMayorForAdmin,
  listMayorsForAdmin,
} from "../repositories/mayor-profile-repository";

export async function MayorProfileAdminView({
  selection,
}: {
  selection?: string;
}) {
  await requireAdmin();
  const mayors = await listMayorsForAdmin();
  const selected =
    selection === "new"
      ? undefined
      : selection
        ? mayors.find((item) => String(item.id) === selection)
        : mayors.find((item) => item.is_current);
  if (selection && selection !== "new" && !selected)
    throw new Error("指定の市長が見つかりません");
  const mayor = selected
    ? await findMayorForAdmin(selected.id)
    : {
        id: 0,
        name: "",
        name_kana: null,
        birth_date: null,
        image_url: null,
        official_url: null,
        start_date: null,
        term_number: null,
        bio: null,
      };
  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold">市長プロフィールの管理</h1>
        <p>
          市長の氏名・写真・経歴・公式リンクを編集します。新しい人物は現職にせず登録し、任期管理で就任を確定します。AIは使用しません。
        </p>
        <p className="text-sm text-muted-foreground">
          現職・歴代の人物の変更は公開ページに反映されます。新規の人物は登録だけでは掲載されず、任期の登録後に公開されます。公式資料を確認してから保存してください。空欄の任意項目は表示されなくなります。
        </p>
        <p className="text-sm text-muted-foreground">
          生年月日は和暦・西暦を使用できます。年齢は自動計算です。別人への氏名の上書きは禁止です。交代・退任・再選は「交代と任期履歴」で行います。複数人で同時編集せず、最新の画面から更新してください。
        </p>
      </header>
      <nav
        aria-label="市長関連の別の更新先"
        className="flex flex-wrap gap-4 text-sm"
      >
        <Link href="/office-history" className="underline">
          交代と任期履歴
        </Link>
        <Link href="/mayor-profile?person=new" className="underline">
          新しい人物を登録
        </Link>
        {mayors.map((item) => (
          <Link
            key={item.id}
            href={`/mayor-profile?person=${item.id}`}
            className="underline"
          >
            {item.name ?? "氏名未設定"}（{item.is_current ? "現職" : "非現職"}）
          </Link>
        ))}
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
      <MayorProfileFormClient key={mayor.id} initial={mayor} />
    </div>
  );
}
