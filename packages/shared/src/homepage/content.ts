type Field = {
  section: string;
  label: string;
  kind: "text" | "body" | "image" | "link" | "optional-link";
  value: string;
};

export const homepageFields = {
  heroBadge: {
    section: "メイン画像・文章",
    label: "肩書き",
    kind: "text",
    value: "大分の暮らしとつながる議会情報",
  },
  heroTitle: {
    section: "メイン画像・文章",
    label: "キャッチコピー",
    kind: "text",
    value: "「おおいたん市議会、いま何しよん？」",
  },
  heroSubtitle: {
    section: "メイン画像・文章",
    label: "サブコピー",
    kind: "text",
    value: "むずかしい議会をわかりやすく。",
  },
  heroImage: {
    section: "メイン画像・文章",
    label: "メイン背景画像",
    kind: "image",
    value: "/img/hero_background_pastel.png",
  },
  councilBadge: {
    section: "案内バナー",
    label: "議会のラベル",
    kind: "text",
    value: "議会",
  },
  councilTitle: {
    section: "案内バナー",
    label: "議会の見出し",
    kind: "text",
    value: "議会で話し合われよんこと",
  },
  questionsTitle: {
    section: "案内バナー",
    label: "一般質問の見出し",
    kind: "text",
    value: "一般質問",
  },
  questionsDescription: {
    section: "案内バナー",
    label: "一般質問の説明",
    kind: "body",
    value: "議員が市長や担当部局に質問した内容をわかりやすく解説します",
  },
  questionsUrl: {
    section: "案内バナー",
    label: "一般質問のリンク先（空欄で最新会期に自動設定）",
    kind: "optional-link",
    value: "",
  },
  topicsTitle: {
    section: "案内バナー",
    label: "トピックスの見出し",
    kind: "text",
    value: "トピックス",
  },
  topicsDescription: {
    section: "案内バナー",
    label: "トピックスの説明",
    kind: "body",
    value: "議会で話し合われている政策や課題を、わかりやすく翻訳した記事です",
  },
  topicsUrl: {
    section: "案内バナー",
    label: "トピックスのリンク先",
    kind: "link",
    value: "/topics",
  },
  committeesTitle: {
    section: "案内バナー",
    label: "本会議・委員会の見出し",
    kind: "text",
    value: "本会議・委員会",
  },
  committeesDescription: {
    section: "案内バナー",
    label: "本会議・委員会の説明",
    kind: "body",
    value: "議会でどんな議論があったかを分かりやすくまとめています",
  },
  committeesUrl: {
    section: "案内バナー",
    label: "本会議・委員会のリンク先",
    kind: "link",
    value: "/committees",
  },
  politiciansTitle: {
    section: "案内バナー",
    label: "市長・議員紹介の見出し",
    kind: "text",
    value: "市長・議員紹介",
  },
  politiciansDescription: {
    section: "案内バナー",
    label: "市長・議員紹介の説明",
    kind: "body",
    value: "大分市の市長と市議会議員を紹介します",
  },
  politiciansUrl: {
    section: "案内バナー",
    label: "市長・議員紹介のリンク先",
    kind: "link",
    value: "/politicians",
  },
  cityBadge: {
    section: "大分市紹介",
    label: "紹介ラベル",
    kind: "text",
    value: "このまちのこと",
  },
  cityTitle: {
    section: "大分市紹介",
    label: "紹介見出し",
    kind: "text",
    value: "大分市って、どんなまち？",
  },
  cityDescription: {
    section: "大分市紹介",
    label: "まちの紹介文",
    kind: "body",
    value:
      "海も、川も、山も身近にある大分市。別府湾に面し、大分川・大野川が流れ、緑豊かな山々に囲まれています。大友宗麟の時代には海外との交流が盛んになり、府内のまちに歴史と文化が育まれました。",
  },
  cityImage: {
    section: "大分市紹介",
    label: "まちの背景写真",
    kind: "image",
    value: "/img/oita/river-koinobori.webp",
  },
  flowerTitle: {
    section: "大分市紹介",
    label: "花の見出し",
    kind: "text",
    value: "市の花・さざんか",
  },
  flowerImage: {
    section: "大分市紹介",
    label: "花の画像",
    kind: "image",
    value: "/illustrations/sazanka.svg",
  },
  flowerDescription: {
    section: "大分市紹介",
    label: "花の紹介文",
    kind: "body",
    value:
      "大分市の市花は「サザンカ」です。1973年（昭和48年）9月1日に制定されました。大分市への親しみを込めて、このサイトのシンボルとしてもこの花を使っています。",
  },
  flowerLinkLabel: {
    section: "大分市紹介",
    label: "花のリンク表示名",
    kind: "text",
    value: "市の花を詳しく知る（大分市公式）",
  },
  flowerUrl: {
    section: "大分市紹介",
    label: "花のリンク先",
    kind: "link",
    value:
      "https://www.city.oita.oita.jp/o001/shisejoho/annai/1118199188920.html",
  },
  treeTitle: {
    section: "大分市紹介",
    label: "木の見出し",
    kind: "text",
    value: "市の木・ホルトノキ",
  },
  treeDescription: {
    section: "大分市紹介",
    label: "木の紹介文",
    kind: "body",
    value:
      "市木は「ホルトノキ」です。市花と同じ1973年9月1日に制定され、大分市の発展を象徴する木として選ばれています。",
  },
  treeLinkLabel: {
    section: "大分市紹介",
    label: "木のリンク表示名",
    kind: "text",
    value: "市の木を詳しく知る（大分市公式）",
  },
  treeUrl: {
    section: "大分市紹介",
    label: "木のリンク先",
    kind: "link",
    value:
      "https://www.city.oita.oita.jp/o001/shisejoho/annai/1118206495123.html",
  },
  tourismTitle: {
    section: "観光・グルメ",
    label: "観光の見出し",
    kind: "text",
    value: "大分市を楽しむ",
  },
  tourismImage: {
    section: "観光・グルメ",
    label: "観光の背景写真",
    kind: "image",
    value: "/img/oita/yumeiro-performance.webp",
  },
  natureTitle: {
    section: "観光・グルメ",
    label: "自然と歴史の見出し",
    kind: "text",
    value: "自然と歴史に出会う",
  },
  natureDescription: {
    section: "観光・グルメ",
    label: "自然と歴史の紹介文",
    kind: "body",
    value:
      "野生のニホンザルに出会える高崎山自然動物園、海の生きものを楽しめる「うみたまご」、まちなかで歴史を感じる府内城など、さまざまな見どころがあります。",
  },
  foodTitle: {
    section: "観光・グルメ",
    label: "食の見出し",
    kind: "text",
    value: "大分ならではの味",
  },
  foodDescription: {
    section: "観光・グルメ",
    label: "食の紹介文",
    kind: "body",
    value:
      "佐賀関の関あじ・関さば、とり天や鶏めしなど、海と山の恵みを味わえるのも大分市の魅力です。",
  },
  tourismLinkLabel: {
    section: "観光・グルメ",
    label: "観光のリンク表示名",
    kind: "text",
    value: "観光・グルメを探す（おおいた市観光ナビ）",
  },
  tourismUrl: {
    section: "観光・グルメ",
    label: "観光のリンク先",
    kind: "link",
    value: "https://www.oishiimati-oita.jp/",
  },
  citySourceLabel: {
    section: "観光・グルメ",
    label: "市の公式出典の表示名",
    kind: "text",
    value: "大分市のあらまし（公式）",
  },
  citySourceUrl: {
    section: "観光・グルメ",
    label: "市の公式出典のリンク先",
    kind: "link",
    value:
      "https://www.city.oita.oita.jp/o029/shisejoho/annai/1269431035754.html",
  },
  aboutTitle: {
    section: "サイト紹介",
    label: "サイト紹介の見出し",
    kind: "text",
    value: "みらいぎかいっちなんなん",
  },
  aboutBadge: {
    section: "サイト紹介",
    label: "サイト紹介ラベル",
    kind: "text",
    value: "みらいぎかいっち＠大分市とは",
  },
  aboutHeadline: {
    section: "サイト紹介",
    label: "サイト紹介のキャッチコピー（改行可）",
    kind: "body",
    value: "大分の暮らしと\n議会の話を、やさしくつなぐ",
  },
  aboutDescription: {
    section: "サイト紹介",
    label: "サイト紹介文",
    kind: "body",
    value:
      "みらいぎかいっち＠大分市は、「おおいたん市議会っち何しよん？」「今、どんな議論しちょるん？」…そういう思いから作った、大分市議会を暮らしの視点でやさしく伝えるプラットフォームなんよ。市民の暮らしと政治が近づくように、わかりやすく整えて発信していくけん。",
  },
} satisfies Record<string, Field>;

export type HomepageField = keyof typeof homepageFields;
export type HomepageContent = Record<HomepageField, string>;
export type HomepageRecord = { content: HomepageContent; revision: number };
export const homepageKeys = Object.keys(homepageFields) as HomepageField[];
export const homepageDefaults = Object.fromEntries(
  homepageKeys.map((key) => [key, homepageFields[key].value])
) as HomepageContent;

export function isHomepageUrl(value: string): boolean {
  if (/[\s\\\u0000-\u001f\u007f]/u.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) {
    try {
      return (
        new URL(value, "https://homepage.invalid").origin ===
        "https://homepage.invalid"
      );
    } catch {
      return false;
    }
  }
  try {
    if (!value.startsWith("https://")) return false;
    const url = new URL(value);
    return (
      /^https:\/\/[^/]/u.test(value) &&
      url.protocol === "https:" &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function parseHomepageContent(input: unknown): HomepageContent {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("トップページの入力形式が不正です");
  }
  const entries = Object.entries(input);
  if (
    entries.length !== homepageKeys.length ||
    entries.some(([key]) => !Object.hasOwn(homepageFields, key))
  ) {
    throw new Error("トップページの項目が一致しません。再読み込みしてください");
  }
  const content = { ...homepageDefaults };
  for (const key of homepageKeys) {
    const field = homepageFields[key];
    const raw: unknown = Reflect.get(input, key);
    if (typeof raw !== "string")
      throw new Error(`${field.label}は文字列で入力してください`);
    const value = raw.trim();
    const limit =
      field.kind === "body" ? 5000 : field.kind === "text" ? 200 : 4000;
    if (value.length > limit || (!value && field.kind !== "optional-link")) {
      throw new Error(`${field.label}は1〜${limit}文字で入力してください`);
    }
    if (
      value &&
      ["image", "link", "optional-link"].includes(field.kind) &&
      !isHomepageUrl(value)
    ) {
      throw new Error(
        `${field.label}はサイト内のパス（/で開始）か認証情報を含まないhttpsのURLを指定してください`
      );
    }
    content[key] = value;
  }
  return content;
}

export function parseHomepageRevision(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new Error("更新番号が不正です。再読み込みしてください");
  }
  return value;
}

export function homepageGuide(
  content: HomepageContent,
  kind: "questions" | "topics" | "committees" | "politicians",
  sessionSlug?: string
) {
  return {
    title: content[`${kind}Title`],
    description: content[`${kind}Description`],
    url:
      content[`${kind}Url`] ||
      (sessionSlug ? `/sessions/${sessionSlug}/questions` : ""),
  };
}
