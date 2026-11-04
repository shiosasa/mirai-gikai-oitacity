import "server-only";
import Link from "next/link";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { TopicEditForm } from "../../client/components/topic-edit-form";
import { getTopicEditValues } from "../../shared/utils/topic-edit";
import { recordId } from "@/features/content-management/shared/utils/content-input";
import { findTopicForEdit } from "../repositories/topic-repository";

export async function TopicEditView({ id }: { id: string }) {
  await requireAdmin();
  if (process.env.TOPIC_PUBLICATION_ENABLED !== "true") {
    throw new Error("トピックス管理が無効です");
  }
  const { article, proposal } = await findTopicForEdit(recordId.parse(id));
  return (
    <div className="space-y-6">
      <Link href="/topics" className="text-primary underline">
        トピックス一覧へ戻る
      </Link>
      <h1 className="text-2xl font-bold">トピックス記事を編集</h1>
      <p className="text-sm text-muted-foreground">
        現在は{article.publish_status === "published" ? "公開中" : "下書き"}
        です。
        公開サイトで表示する内容を編集します。記事と元データを一括保存し、空欄にした項目は表示から消えます。
        初回公開日・出典の議事録・AIインタビューの紐づけは変更しません。
      </p>
      <TopicEditForm initial={getTopicEditValues(article, proposal)} />
      <details className="rounded-lg border p-4">
        <summary>出典・紐づけ（この画面では変更しません）</summary>
        <p className="mt-3 text-sm">
          サイト公開日：{proposal?.published_date ?? "未設定"}
        </p>
        <p className="text-sm">公開本文の元データ：{article.bill_id}</p>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm">
          {JSON.stringify(article.source_refs ?? [], null, 2)}
        </pre>
        <p className="text-sm">
          出典を変更する場合は議事録の内容と照合が必要です。既存の出典情報はそのまま保持します。
        </p>
      </details>
    </div>
  );
}
