import type { Metadata } from "next";
import { OitaPrototypeClient } from "@/app/dev/features/general-questions/oita-prototype/_components/oita-prototype-client";
import { Container } from "@/components/layouts/container";
import { loadOitaGeneralQuestions } from "@/features/general-questions/server/loaders/load-oita-general-questions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "一般質問プレビュー（大分市議会版試作）",
  robots: { index: false, follow: false },
};

export default async function OitaGeneralQuestionsPreviewPage() {
  const questions = await loadOitaGeneralQuestions({
    limit: 30,
    lifeRelatedLimit: 3,
    includeDrafts: true,
  });

  return (
    <Container className="py-10">
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="inline-flex rounded-full border border-oita-pink-accent bg-oita-pink-light px-3 py-1 text-xs font-semibold text-oita-pink">
            試作プレビュー（Supabase一般質問データ・暮らしに近い話題{" "}
            {questions.length}件・検索エンジン非公開）
          </p>
          <h1 className="text-2xl font-bold text-mirai-text">
            大分市議会版 一般質問（一問一答×一覧統合案）
          </h1>
          <p className="text-sm text-mirai-text-secondary">
            Supabase
            の一般質問データから暮らしに近い話題を最大3件抽出し、一覧カード選択で一問一答詳細へ切り替えるプレビューです。
          </p>
        </header>
        {questions.length > 0 ? (
          <OitaPrototypeClient questions={questions} />
        ) : (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-mirai-text-secondary">
            Supabase の一般質問データ（<code>general_questions</code>
            ）がまだ登録されていないため、表示できる議事録がありません。
          </div>
        )}
      </div>
    </Container>
  );
}
