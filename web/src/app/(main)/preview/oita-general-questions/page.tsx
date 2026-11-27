import type { Metadata } from "next";
import { OitaPrototypeClient } from "@/app/dev/features/general-questions/oita-prototype/_components/oita-prototype-client";
import {
  attachPrototypeAvatars,
  OITA_PROTOTYPE_QUESTIONS,
} from "@/app/dev/features/general-questions/oita-prototype/_lib/oita-prototype-helpers";
import { Container } from "@/components/layouts/container";
import { getCurrentMayor } from "@/features/politicians/server/loaders/get-current-mayor";
import { getPublishedPoliticians } from "@/features/politicians/server/loaders/get-published-politicians";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "一般質問プレビュー（大分市議会版試作）",
  robots: { index: false, follow: false },
};

export default async function OitaGeneralQuestionsPreviewPage() {
  const [politicians, mayor] = await Promise.all([
    getPublishedPoliticians().catch(() => []),
    getCurrentMayor().catch(() => null),
  ]);

  const councilorImages = politicians
    .map((p) => p.image_url)
    .filter((url): url is string => Boolean(url));

  const questionsWithAvatars = attachPrototypeAvatars(
    OITA_PROTOTYPE_QUESTIONS,
    councilorImages,
    mayor?.image_url
  );

  return (
    <Container className="py-10">
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="inline-flex rounded-full border border-oita-pink-accent bg-oita-pink-light px-3 py-1 text-xs font-semibold text-oita-pink">
            試作プレビュー（サンプル3件・検索エンジン非公開）
          </p>
          <h1 className="text-2xl font-bold text-mirai-text">
            大分市議会版 一般質問（一問一答×一覧統合案）
          </h1>
          <p className="text-sm text-mirai-text-secondary">
            テーマタグでの絞り込み・質問者一覧と、大分市議会の一問一答方式（質問→答弁→再質問→再答弁）を組み合わせた試作UIです。顔アイコンには議員・市長紹介ページの登録画像を表示しています。
          </p>
        </header>
        <OitaPrototypeClient questions={questionsWithAvatars} />
      </div>
    </Container>
  );
}
