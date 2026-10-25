/**
 * サイト設定ファイル（Admin）
 * Fork して別の地方議会向けに使用する場合はこのファイルを変更してください。
 */
export const siteConfig = {
  siteName: "みらい議会ー大分市版",
  cityName: "大分市",
  councilName: "大分市議会",
  councilBaseUrl: "https://mirai-gikai-oitacity-web.vercel.app/",
  councilBillsDetailUrl:
    "https://mirai-gikai-oitacity-web.vercel.app/committees",
  councilFactionExamples:
    "大分市議会、みらいぎかいっち、おおいた、おんせん県、大友宗麟",
} as const;
