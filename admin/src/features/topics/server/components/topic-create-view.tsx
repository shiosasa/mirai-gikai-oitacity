import "server-only";
import Link from "next/link";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { TopicCreateForm } from "../../client/components/topic-create-form";
import { findTopicSourceOptions } from "../repositories/topic-source-repository";

export async function TopicCreateView() {
  await requireAdmin();
  if (process.env.TOPIC_PUBLICATION_ENABLED !== "true") {
    throw new Error("トピックス管理が無効です");
  }
  const sources = await findTopicSourceOptions();
  return (
    <div className="space-y-6">
      <Link href="/topics" className="underline">
        トピックス一覧へ戻る
      </Link>
      <h1 className="text-2xl font-bold">トピックス記事を追加</h1>
      <p className="text-muted-foreground">
        AI生成は不要です。確認済みの本文・関連リンク・出典を入力してください。
        下書き保存後に内容を確認して一覧から公開します。インタビューは別途質問を設定して公開します。
      </p>
      <TopicCreateForm sources={sources} />
    </div>
  );
}
