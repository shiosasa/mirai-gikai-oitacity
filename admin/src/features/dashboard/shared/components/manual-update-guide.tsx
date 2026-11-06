import Link from "next/link";

const operations = [
  {
    href: "/office-history",
    label: "交代と任期履歴",
    support: "退任・後任交代・再選・再就任を記録",
    details:
      "人物IDと過去の活動を維持して、現職と歴代の表示を切り替えます。新しい人は先にプロフィールで登録し、公式出典・就退任日・期数を確認します。同じ人の再選・再就任は既存人物を選びます。",
    note: "保存すると公開対象が変わります。未来日の予約はできません。退任日は在任最終日、新任は翌日以降です。導入前の議員の就任日は未確認で、公式資料で確定できます。市長の資料は確認済み任期の開催日で振り分けます。",
  },
  {
    href: "/mayor-profile",
    label: "市長プロフィール",
    support: "現職・歴代市長の編集と新しい人物の登録",
    details:
      "氏名、ふりがな、生年月日、写真URL、市長室の公式URL、紹介文・経歴・基本方針を編集します。就任日・期数は任期管理で登録します。一覧の5つの柱はプレビューを確認してください。",
    note: "新規人物の登録だけでは一覧に掲載されません。就任を別途登録してください。既存人物の保存は公開に反映されます。別人への氏名の上書きは禁止です。提案理由と記者会見の本文・公開日・NEWは変更しません。",
  },
  {
    href: "/politicians",
    label: "議員紹介",
    support: "大分市の公開項目で新規登録・編集",
    details:
      "氏名、ふりがな、議席番号、生年月日、当選回数、会派、常任・特別委員会、写真URL、公式サイト、公式の公開住所・電話番号を編集します。年齢は生年月日から計算されます。",
    note: "新規人物は登録後に任期管理で就任を確定すると一覧に掲載されます。既存人物の変更は公開に反映されます。欠番は対象外です。議員IDと発言の紐づけは維持します。別人への上書きは禁止です。",
  },
  {
    href: "/topics",
    label: "トピックス記事",
    support: "手入力で新規下書き・編集・公開",
    details:
      "本文、カテゴリ、状況、議決日、複数の関連リンクの表示名・URL・表示順、複数の出典開催日・議案を保存。記事と公開本文の元データを一括更新します。",
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
          トピックスの新規追加・出典編集、議員紹介、市長プロフィールの手動更新を整備。未対応の項目は下に明記しています。
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
            導入前の全任期の復元：過去の選挙・在任期間は推測して登録しません。誤った確定済み任期の修正は、資料と関連表示を確認して対応が必要です。
          </li>
          <li>
            トップページの大分市紹介、写真・装飾、固定の案内文：コード・画像ファイル側の変更が必要です。
          </li>
          <li>
            トピックスの関連リンクは表示名とURLを複数登録し、上へ・下へで並べ替え、削除できます。保存前のプレビューで表示順とリンク先を確認してください。全件削除すると関連リンクは表示されません。出典の議事録・議案は別の出典欄で設定します。
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
