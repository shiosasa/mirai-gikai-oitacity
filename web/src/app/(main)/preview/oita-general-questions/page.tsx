import { createAdminClient } from "@mirai-gikai/supabase";
import type { Metadata } from "next";
import { OitaPrototypeClient } from "@/app/dev/features/general-questions/oita-prototype/_components/oita-prototype-client";
import {
  mapSupabaseQuestionsToPrototype,
  selectLifeRelatedQuestions,
} from "@/app/dev/features/general-questions/oita-prototype/_lib/oita-prototype-helpers";
import { Container } from "@/components/layouts/container";
import type { GeneralQuestion } from "@/features/general-questions/shared/types";
import { getCurrentMayor } from "@/features/politicians/server/loaders/get-current-mayor";
import { getPublishedPoliticians } from "@/features/politicians/server/loaders/get-published-politicians";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "一般質問プレビュー（大分市議会版試作）",
  robots: { index: false, follow: false },
};

async function loadPreviewGeneralQuestions(): Promise<GeneralQuestion[]> {
  try {
    const supabase = createAdminClient();
    const { data: published } = await supabase
      .from("general_questions")
      .select("*")
      .eq("publish_status", "published")
      .order("created_at", { ascending: false })
      .limit(30);

    if (published && published.length > 0) {
      return published.map((row) => ({
        ...row,
        topics: Array.isArray(row.topics) ? row.topics : [],
      })) as GeneralQuestion[];
    }

    const { data: latest } = await supabase
      .from("general_questions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    if (!latest || latest.length === 0) return [];
    return latest.map((row) => ({
      ...row,
      topics: Array.isArray(row.topics) ? row.topics : [],
    })) as GeneralQuestion[];
  } catch {
    return [];
  }
}

export default async function OitaGeneralQuestionsPreviewPage() {
  const [politicians, mayor, dbQuestions] = await Promise.all([
    getPublishedPoliticians().catch(() => []),
    getCurrentMayor().catch(() => null),
    loadPreviewGeneralQuestions(),
  ]);

  const mappedQuestions = mapSupabaseQuestionsToPrototype(
    dbQuestions,
    politicians,
    mayor?.image_url
  );
  const questions = selectLifeRelatedQuestions(mappedQuestions, 3);

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
