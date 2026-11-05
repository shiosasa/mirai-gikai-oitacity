import "server-only";
import Link from "next/link";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { recordId } from "@/features/content-management/shared/utils/content-input";
import { TopicEditForm } from "../../client/components/topic-edit-form";
import { getTopicEditValues } from "../../shared/utils/topic-edit";
import { findTopicForEdit } from "../repositories/topic-repository";
import { findTopicSourceOptions } from "../repositories/topic-source-repository";

export async function TopicEditView({ id }: { id: string }) {
  await requireAdmin();
  if (process.env.TOPIC_PUBLICATION_ENABLED !== "true") {
    throw new Error("トピックス管理が無効です");
  }
  const [{ article, proposal }, sources] = await Promise.all([
    findTopicForEdit(recordId.parse(id)),
    findTopicSourceOptions(),
  ]);
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
        出典は開催日・議案から選択して編集できます。初回公開日・AIインタビューの紐づけは変更しません。
      </p>
      <TopicEditForm
        initial={getTopicEditValues(article, proposal)}
        sources={sources}
      />
      {article.interview_bill_id && (
        <div className="space-y-2 rounded-lg border p-4">
          <h2 className="font-semibold">この記事のインタビュー</h2>
          <p className="text-sm text-muted-foreground">
            インタビューを使う場合は、受け皿と質問設定の両方を公開してください。記事の公開だけではインタビューは公開されません。回答の実施にはAIサービスが必要です。
          </p>
          <p>
            <Link
              className="text-primary underline"
              href={`/bills/${article.interview_bill_id}/edit`}
            >
              インタビュー受け皿の基本情報・公開状態を管理
            </Link>
          </p>
          <p>
            <Link
              className="text-primary underline"
              href={`/bills/${article.interview_bill_id}/interview`}
            >
              この記事のインタビュー設定・質問を手入力で管理
            </Link>
          </p>
        </div>
      )}
      <details className="rounded-lg border p-4">
        <summary>保存済みの公開履歴・元データ</summary>
        <p className="mt-3 text-sm">
          サイト公開日：{proposal?.published_date ?? "未設定"}
        </p>
        <p className="text-sm">公開本文の元データ：{article.bill_id}</p>
      </details>
    </div>
  );
}
