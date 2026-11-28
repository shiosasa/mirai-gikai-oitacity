import type { Metadata } from "next";
import { OitaPrototypeClient } from "@/app/dev/features/general-questions/oita-prototype/_components/oita-prototype-client";
import { Container } from "@/components/layouts/container";
import { loadOitaGeneralQuestions } from "@/features/general-questions/server/loaders/load-oita-general-questions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "一般質問 | みらいぎかいっち＠大分",
  description:
    "大分市議会の一般質問を、暮らしに関わるテーマ別・議員別の一問一答形式でわかりやすく確認できます。",
};

type GeneralQuestionsPageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function GeneralQuestionsPage({
  searchParams,
}: GeneralQuestionsPageProps) {
  const [{ id }, questions] = await Promise.all([
    searchParams,
    loadOitaGeneralQuestions(),
  ]);

  return (
    <Container className="py-10">
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="inline-flex rounded-full border border-oita-pink-accent bg-oita-pink-light px-3 py-1 text-xs font-semibold text-oita-pink">
            大分市議会 一般質問（一問一答）
          </p>
          <h1 className="text-2xl font-bold text-mirai-text">
            議員の質問と市のこたえ（一般質問）
          </h1>
          <p className="text-sm text-mirai-text-secondary">
            暮らしやまちの課題について、議員が市に質問し、市が答えた内容（一般質問）をわかりやすくまとめました。気になるカードを選ぶと、詳しいやりとりや関連する議事録、議員のプロフィールを確認できます。
          </p>
        </header>
        {questions.length > 0 ? (
          <OitaPrototypeClient
            questions={questions}
            initialSelectedId={id ?? null}
          />
        ) : (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-mirai-text-secondary">
            現在公開されている一般質問データはありません。
          </div>
        )}
      </div>
    </Container>
  );
}
