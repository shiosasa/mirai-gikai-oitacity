/**
 * サイト設定ファイル
 * Fork して別の地方議会向けに使用する場合はこのファイルを変更してください。
 * @see docs/kawasaki/20260304_1000_別地域向けfork手順.md
 */
export const siteConfig = {
  siteName: "みらいぎかいっち＠大分市",
  siteDescription:
    "「おおいたん市議会っち何しよん？」「今、どんな議論しちょるん？」…そういう思いから作った、大分市議会を暮らしの視点でやさしく伝えるプラットフォームなんよ",
  cityName: "大分市",
  councilName: "大分市議会",
  councilSchedule: [
    {
      name: "Ｒ8第4回",
      start_date: "2026-11-30",
      end_date: "2026-12-14",
    },
  ],
  catchphrase: "おおいたん市議会いま何しよん？",
  subCatchphrase: "むずかしい議会をわかりやすく。",
  keywords: [
    "みらいぎかいっち",
    "大分市",
    "大分市議会",
    "議案",
    "地方政治",
    "政策",
    "大分",
    "解説",
  ],
  councilBaseUrl: "https://www.city.oita.oita.jp/shigikai/index.html",
  /** 議案・議決結果の一覧ページ */
  councilBillsDetailUrl:
    "https://www.city.oita.oita.jp/shigikai/honkaigi/yotegian/index.html",
  twitterHashtag: "みらいぎかいっち", // # なし
  externalLinks: {
    report: "https://x.com/bakumon0907",
    aboutNote: "",
    donation: "https://team-mir.ai/support/donation",
    teamAbout: "https://team-mir.ai/about",
    /** 利用規約・プライバシーポリシー・FAQは本サイト内に用意している */
    terms: "/terms",
    privacy: "/privacy",
    faq: "/faq",
  },
  /**
   * ページを管理する政党名（空文字列の場合は政党名を省略した汎用表現を使用）
   * 例: "チームみらい"
   */
  managingParty: "" as string,
  /**
   * サービス運営者情報
   * 利用規約や問い合わせ先に使用します。
   */
  operator: {
    name: "「となりの政治」しおぱん" as string,
    contactUrl: "https://sites.google.com/view/tonarinoseiji/" as string,
    /** 利用規約の準拠法・管轄裁判所（第一審の専属的合意管轄） */
    jurisdiction: "大分地方裁判所" as string,
  },
  /**
   * AI機能の有効/無効設定
   * 本番環境のコスト管理のため、機能ごとにオン/オフを切り替えられます。
   */
  features: {
    /** AIチャット機能（議案への質問・テキスト選択からの質問）*/
    aiChat: true,
    /** AIインタビュー機能（議案当事者へのヒアリング）*/
    aiInterview: true,
    /**
     * チームみらいセクションの表示（トップページ・フッター・デスクトップメニュー）
     * 非公式運営など、党の公式サービスとして出さない場合は false にする。
     */
    showTeamMiraiSection: false as boolean,
    /** 会派スタンス表示（採決結果の詳細が公開されていない議会では false にする） */
    showFactionStances: true as boolean,
  },
} as const;
