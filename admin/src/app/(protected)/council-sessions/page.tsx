import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { CouncilSessionForm } from "@/features/council-sessions/client/components/council-session-form";
import { CouncilSessionList } from "@/features/council-sessions/client/components/council-session-list";
import { loadCouncilSessions } from "@/features/council-sessions/server/loaders/load-council-sessions";

export default async function CouncilSessionsPage() {
  const sessions = await loadCouncilSessions();

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">定例会・会期管理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            定例会や臨時会の会期データ、議案に紐づく会期情報を管理します
          </p>
        </div>
        <Link
          href="/homepage"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Info className="size-4" />
          トップページの活動ステータス設定はこちら
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* 定例会追加セクション */}
      <section className="mb-8 rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">定例会・臨時会を追加</h2>
        <CouncilSessionForm />
      </section>

      {/* 定例会一覧セクション */}
      <section className="rounded-lg border bg-white p-6">
        <CouncilSessionList sessions={sessions} />
      </section>
    </div>
  );
}
