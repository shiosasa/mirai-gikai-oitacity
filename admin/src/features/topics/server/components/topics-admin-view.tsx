import "server-only";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { TopicPublicationButton } from "../../client/components/topic-publication-button";
import { findTopicsForAdmin } from "../repositories/topic-repository";

export async function TopicsAdminView() {
  await requireAdmin();
  if (process.env.TOPIC_PUBLICATION_ENABLED !== "true") {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-bold">トピックス管理</h1>
        <p>
          公開機能はまだ有効になっていません。承認後にDB変更と環境変数の設定が必要です。
        </p>
      </section>
    );
  }
  const topics = await findTopicsForAdmin();
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">トピックス管理</h1>
      <p>
        初めて公開した日をサイト公開日として記録します。下書きに戻して再公開しても、元の公開日は変わりません。
      </p>
      <ul className="space-y-4">
        {topics.map((topic) => (
          <li key={topic.id} className="rounded-lg border p-4 space-y-3">
            <h2 className="font-semibold">{topic.title}</h2>
            <p>
              {topic.publish_status === "published" ? "公開中" : "下書き"}
              {" / サイト公開日: "}
              {topic.proposals?.published_date ?? "未設定"}
            </p>
            <TopicPublicationButton
              id={topic.id}
              status={topic.publish_status}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
