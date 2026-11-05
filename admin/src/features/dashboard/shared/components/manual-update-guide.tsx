import Link from "next/link";

const operations = [
  {
    href: "/topics",
    label: "トピックス記事",
    support: "手入力で新規下書き・編集・公開",
    details:
      "本文、カテゴリ、状況、議決日、関連する公式ページの表示名・URL、複数の出典開催日・議案を保存。記事と公開本文の元データを一括更新します。",
    note: "公開中の記事は保存すると反映されます。インタビュー設定は記事の編集画面から別途管理します。",
  },
  {
    href: "/minutes",
    label: "議事録要約",
    support: "会議・開催日の新規追加と編集",
    details:
      "原文、短い要約、詳しい要約、決定事項、出席者、議案を手入力できます。",
    note: "下書き機能はありません。保存で公開対象になります。記事の出典も変わるため、議案名・開催日の変更時は関連するトピックスを再確認してください。",
  },
  {
    href: "/bills",
    label: "議案カード",
    support: "新規登録・説明編集・タグ・公開管理",
    details:
      "議案の基本情報と解説、会派の賛否、タグ、議事録内のカード表示をそれぞれの編集画面で管理します。",
    note: "カードは議事録との紐付けも必要です。議案を新規登録しただけでは出典の議事録の議案欄に自動追加されません。",
  },
  {
    href: "/press-conferences",
    label: "市長記者会見",
    support: "新規下書き・項目と発言の編集・公開",
    details:
      "開催日、タイトル、動画、発表・質疑、要約・詳細、配付資料URL、発言を手入力します。",
    note: "基本情報・各項目・各発言は別保存です。全項目の確認後に公開してください。",
  },
  {
    href: "/mayor-proposals",
    label: "市長提案理由",
    support: "本会議に紐付けて原文・要約・URLを編集",
    details:
      "新しい会期は先に「議事録要約」で本会議を追加し、その会議の提案理由を登録します。",
    note: "下書き機能はありません。公式原文がある会議が公開対象です。",
  },
  {
    href: "/politician-speeches",
    label: "議会での発言",
    support: "新規下書き・編集・公開",
    details:
      "議員・出典開催日を選び、見出し・原文引用・任意の補足を手入力します。",
    note: "引用は原文と一致させ、発言者と前後の文脈も確認してください。",
  },
  {
    href: "/topic-voices",
    label: "インタビュー結果・生の声",
    support: "回答の確認・管理者公開承認・記事掲載",
    details:
      "本人の公開同意と管理者の承認がそろった回答を選び、記事への掲載を管理します。",
    note: "回答収集・自動要約自体はAIを使用します。AI停止中に回答者の回答や公開同意を作成する代替機能ではありません。",
  },
  {
    href: "/information",
    label: "お知らせ",
    support: "新規追加・編集・公開",
    details: "トップページのお知らせを手入力で管理します。",
    note: "お知らせを書くだけでは記事・議案・会見などの本文は更新されません。",
  },
] as const;

export function ManualUpdateGuide() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold">AIなしで更新するためのガイド</h1>
        <p>
          文章の手入力・保存・公開にはAIトークンを使用しません。出典を確認した文章を入力し、保存前の確認を行ってください。
        </p>
        <p className="text-sm text-muted-foreground">
          第1段階：トピックスの新規追加・出典編集を整備。未対応の項目は下に明記しています。
        </p>
      </header>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">コンテンツ別の更新先と注意点</h2>
        {operations.map((operation) => (
          <article
            key={operation.href}
            className="space-y-2 rounded-lg border bg-card p-4"
          >
            <h3 className="font-semibold">
              <Link href={operation.href} className="underline">
                {operation.label}
              </Link>
            </h3>
            <p className="text-sm font-medium">{operation.support}</p>
            <p>{operation.details}</p>
            <p className="text-sm text-muted-foreground">{operation.note}</p>
          </article>
        ))}
      </section>
      <section className="space-y-3 rounded-lg border p-4">
        <h2 className="text-xl font-semibold">保存・公開・NEWの関係</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>下書きのあるコンテンツは、まず下書きで追加・保存します。</li>
          <li>
            原文・数字・発言者・関連リンクを確認してから公開します。公開中の本文編集は即時に反映され得ます。
          </li>
          <li>
            NEWは最初の公開から14日間です。本文の編集や再公開だけでは起算日を変更しません。
          </li>
          <li>
            トピックスの出典設定は議案カードのカテゴリと検索にも使います。関係のない議案を選ばないでください。
          </li>
        </ol>
      </section>
      <section className="space-y-3 rounded-lg border p-4">
        <h2 className="text-xl font-semibold">
          まだ管理画面だけでは完結しないもの
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            市長のプロフィール：公開ページは専用データを参照しますが、専用の編集画面は未対応です。
          </li>
          <li>
            議員紹介：既存の管理画面と大分市の公開ページで使う項目に差があり、生年月日・当選回数・所属委員会・画像などの整合確認と編集機能の統一が必要です。既存画面だけで全項目を更新できるとは限りません。
          </li>
          <li>
            トップページの大分市紹介、写真・装飾、固定の案内文：コード・画像ファイル側の変更が必要です。
          </li>
          <li>
            トピックスの関連する公式ページURLは現在1件です。出典の議事録・議案は複数登録できます。外部資料リンクの複数登録は未対応です。
          </li>
          <li>
            AIインタビューの実施・自動要約・自動分析：手入力による通常のコンテンツ更新とは別で、AIサービスが必要です。
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          これらは次の整備対象です。管理画面上の案内だけで、未対応機能が使えるようになるわけではありません。
        </p>
      </section>
    </div>
  );
}
