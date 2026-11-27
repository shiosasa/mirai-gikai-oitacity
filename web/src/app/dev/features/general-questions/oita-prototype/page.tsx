import { OitaPrototypeClient } from "./_components/oita-prototype-client";
import { OITA_PROTOTYPE_QUESTIONS } from "./_lib/oita-prototype-helpers";

export default function OitaGeneralQuestionsPrototypePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="inline-flex rounded-full border border-oita-pink-accent bg-oita-pink-light px-3 py-1 text-xs font-semibold text-oita-pink">
          試作プレビュー（サンプル3件・一般公開なし）
        </p>
        <h1 className="text-2xl font-bold text-mirai-text">
          大分市議会版 一般質問（一問一答×一覧統合案）
        </h1>
        <p className="text-sm text-mirai-text-secondary">
          テーマタグでの絞り込み・質問者一覧と、大分市議会の一問一答方式（質問→答弁→再質問→再答弁）を組み合わせた試作UIです。
        </p>
      </header>
      <OitaPrototypeClient questions={OITA_PROTOTYPE_QUESTIONS} />
    </div>
  );
}
