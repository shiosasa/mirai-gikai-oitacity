import { ARTICLE_CATEGORIES } from "@/features/bills/shared/utils/article-category";
import type { GeneralQuestion } from "@/features/general-questions/shared/types";

export type OitaExchangeTurn = {
  id: string;
  speakerRole: "questioner" | "executive";
  speakerLabel: string;
  turnType: "質問" | "答弁" | "再質問" | "再答弁";
  summary: string;
  rawText: string;
  avatarUrl?: string | null;
};

export type OitaQuestionTopic = {
  id: string;
  title: string;
  tag: string;
  exchanges: OitaExchangeTurn[];
};

export type OitaGeneralQuestion = {
  id: string;
  sessionLabel: string;
  sessionDayLabel: string;
  questionOrder: number;
  questionerName: string;
  faction: string;
  avatarUrl?: string | null;
  overview: string;
  minutesSummaryUrl?: string | null;
  topics: OitaQuestionTopic[];
};

export const OITA_PROTOTYPE_QUESTIONS: OitaGeneralQuestion[] = [
  {
    id: "oita-sample-1",
    sessionLabel: "令和8年第3回定例会（試作サンプル）",
    sessionDayLabel: "第1日",
    questionOrder: 1,
    questionerName: "サンプル議員 A",
    faction: "自由民主党",
    overview:
      "避難所のバリアフリー対応と、町内会・自主防災組織への資機材補助の拡充について一問一答で質問しました。",
    topics: [
      {
        id: "topic-1-1",
        title: "福祉避難所の開設手順と要配慮者支援",
        tag: "安心・安全・防災",
        exchanges: [
          {
            id: "ex-1-1-1",
            speakerRole: "questioner",
            speakerLabel: "サンプル議員 A",
            turnType: "質問",
            summary:
              "指定避難所から福祉避難所への移動に時間がかかるケースがある。発災直後から直接受け入れできる体制を整える考えは。",
            rawText:
              "大規模災害の際、高齢者や障がいのある方が一般避難所を経由して福祉避難所へ移動するのは大きな負担です。あらかじめ対象者を登録し、直接受け入れられる仕組みを検討すべきではないでしょうか。",
          },
          {
            id: "ex-1-1-2",
            speakerRole: "executive",
            speakerLabel: "総務部長",
            turnType: "答弁",
            summary:
              "事前登録制と施設との協定見直しを進め、今年度内に市内3か所でモデル運用を開始する予定です。",
            rawText:
              "福祉避難所の直接開設については、受入施設の人員体制や物資備蓄の課題を踏まえ、介護事業所等との協定を見直したうえで、モデル地区での試行運用を進めてまいります。",
          },
          {
            id: "ex-1-1-3",
            speakerRole: "questioner",
            speakerLabel: "サンプル議員 A",
            turnType: "再質問",
            summary:
              "モデル地区の選定基準と、住民への周知時期を具体的に示してほしい。",
            rawText:
              "試行運用にあたっては、どの地域を対象とし、いつ頃から対象世帯へ案内を行うのか、具体的なスケジュールをお聞かせください。",
          },
          {
            id: "ex-1-1-4",
            speakerRole: "executive",
            speakerLabel: "総務部長",
            turnType: "再答弁",
            summary:
              "浸水想定区域を含む3校区を対象に、秋の防災訓練に合わせて個別案内を行う予定です。",
            rawText:
              "ハザードマップ上の浸水想定や高齢化率を踏まえて3校区を選定し、秋の総合防災訓練に合わせてケアマネジャー等を通じた個別案内を実施する予定です。",
          },
        ],
      },
      {
        id: "topic-1-2",
        title: "通学路の交差点安全対策",
        tag: "子育て・教育",
        exchanges: [
          {
            id: "ex-1-2-1",
            speakerRole: "questioner",
            speakerLabel: "サンプル議員 A",
            turnType: "質問",
            summary:
              "見通しの悪い通学路交差点へのカラー舗装とガードレール設置の進捗状況は。",
            rawText:
              "PTAからも要望が上がっている小学校周辺の交差点について、カラー舗装や防護柵の整備スケジュールをお伺いします。",
          },
          {
            id: "ex-1-2-2",
            speakerRole: "executive",
            speakerLabel: "土木建築部長",
            turnType: "答弁",
            summary:
              "危険度が高い12か所を優先指定し、夏休み期間中の完了を目指して順次施工しています。",
            rawText:
              "学校および警察との合同点検で緊急性が高いと判断した12か所について、夏休み中の工事完了を目標に整備を進めております。",
          },
        ],
      },
    ],
  },
  {
    id: "oita-sample-2",
    sessionLabel: "令和8年第3回定例会（試作サンプル）",
    sessionDayLabel: "第1日",
    questionOrder: 2,
    questionerName: "サンプル議員 B",
    faction: "ネットワークみらい",
    overview:
      "保育士の処遇改善と、病児保育の予約デジタル化について一問一答形式で質しました。",
    topics: [
      {
        id: "topic-2-1",
        title: "病児保育のスマホ予約・空き状況見える化",
        tag: "子育て・教育",
        exchanges: [
          {
            id: "ex-2-1-1",
            speakerRole: "questioner",
            speakerLabel: "サンプル議員 B",
            turnType: "質問",
            summary:
              "朝一番に電話が繋がらないという保護者の声が多い。オンラインで空き確認と予約ができる仕組みを導入すべきでは。",
            rawText:
              "共働き世帯にとって病児保育は不可欠ですが、電話予約が集中して繋がりにくい状況が続いています。スマホで24時間空き状況確認と仮予約ができる仕組みが必要です。",
          },
          {
            id: "ex-2-1-2",
            speakerRole: "executive",
            speakerLabel: "子ども部長",
            turnType: "答弁",
            summary:
              "全実施施設とシステム連携の調整を進めており、来年度の本格導入を目指します。",
            rawText:
              "保護者の負担軽減に向けて、空き状況のリアルタイム表示とWeb予約システムの導入を各医療機関と協議しており、来年度からの運用開始を目指してまいります。",
          },
          {
            id: "ex-2-1-3",
            speakerRole: "questioner",
            speakerLabel: "サンプル議員 B",
            turnType: "再質問",
            summary:
              "キャンセル待ちの繰り上げ通知も自動化されるのか確認したい。",
            rawText:
              "予約が埋まっていた場合でも、キャンセルが出た際に自動で繰り上げ通知が届く機能は備える予定でしょうか。",
          },
          {
            id: "ex-2-1-4",
            speakerRole: "executive",
            speakerLabel: "子ども部長",
            turnType: "再答弁",
            summary:
              "キャンセル待ち通知機能も含めて仕様を検討しており、利便性を高めます。",
            rawText:
              "キャンセル発生時の自動通知機能につきましても、導入するシステムの必須要件として組み込む方向で調整しております。",
          },
        ],
      },
    ],
  },
  {
    id: "oita-sample-3",
    sessionLabel: "令和8年第3回定例会（試作サンプル）",
    sessionDayLabel: "第2日",
    questionOrder: 1,
    questionerName: "サンプル議員 C",
    faction: "公明党",
    overview:
      "郊外エリアの移動手段確保に向けたデマンド交通の実証拡大と、窓口手続きのデジタル支援について質問しました。",
    topics: [
      {
        id: "topic-3-1",
        title: "予約型乗合タクシー（デマンド交通）の運行エリア拡大",
        tag: "まちづくり・暮らし",
        exchanges: [
          {
            id: "ex-3-1-1",
            speakerRole: "questioner",
            speakerLabel: "サンプル議員 C",
            turnType: "質問",
            summary:
              "免許返納後の高齢者の買い物・通院を支えるため、デマンド交通の運行便数と対象区域を広げるべきでは。",
            rawText:
              "バス路線の減便が続く郊外地域において、デマンド型乗合タクシーのニーズが高まっています。利用実態を踏まえたエリア拡大のお考えをお伺いします。",
          },
          {
            id: "ex-3-1-2",
            speakerRole: "executive",
            speakerLabel: "市長",
            turnType: "答弁",
            summary:
              "利用実績が好調な地区から順次運行日数を増やし、来年度は新たに2地区で実証を開始します。",
            rawText:
              "地域の移動の足を守ることは極めて重要と認識しています。既存地区の利用状況や地元自治会からの要望を踏まえ、運行回数の見直しと新規2地区での実証運行を進めてまいります。",
          },
        ],
      },
      {
        id: "topic-3-2",
        title: "支所・公民館でのスマホ相談窓口",
        tag: "まちの仕組み・選挙",
        exchanges: [
          {
            id: "ex-3-2-1",
            speakerRole: "questioner",
            speakerLabel: "サンプル議員 C",
            turnType: "質問",
            summary:
              "行政手続きのオンライン化に伴い、高齢者向けに身近な公民館で操作をサポートする体制を強化すべきでは。",
            rawText:
              "オンライン申請が広がる一方で、操作に不安のある方を取り残さないための伴走支援が重要です。各地区公民館での相談会の拡充を求めます。",
          },
          {
            id: "ex-3-2-2",
            speakerRole: "executive",
            speakerLabel: "企画部長",
            turnType: "答弁",
            summary:
              "デジタル推進員と地域おこし協力隊が連携し、月2回以上の出張相談会を各地区で実施します。",
            rawText:
              "誰一人取り残さないデジタル化に向け、市内各公民館でのスマホ・行政手続相談会を月2回以上へ増設し、丁寧なサポートを行ってまいります。",
          },
        ],
      },
    ],
  },
];

export type OitaQuestionTagCount = {
  tag: string;
  count: number;
};

const STANDARD_QUESTION_CATEGORIES = ARTICLE_CATEGORIES.filter(
  (category) => category !== "すべて"
);

export function collectOitaQuestionTags(
  questions: OitaGeneralQuestion[]
): OitaQuestionTagCount[] {
  const counts = new Map<string, number>();
  for (const question of questions) {
    const uniqueTags = new Set(question.topics.map((topic) => topic.tag));
    for (const tag of uniqueTags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  const ordered = STANDARD_QUESTION_CATEGORIES.map((tag) => ({
    tag,
    count: counts.get(tag) ?? 0,
  }));
  const extra = Array.from(counts.entries())
    .filter(
      ([tag]) =>
        !STANDARD_QUESTION_CATEGORIES.includes(
          tag as (typeof STANDARD_QUESTION_CATEGORIES)[number]
        )
    )
    .map(([tag, count]) => ({ tag, count }));
  return [...ordered, ...extra];
}

export function filterOitaQuestionsByTag(
  questions: OitaGeneralQuestion[],
  selectedTag: string | null
): OitaGeneralQuestion[] {
  if (!selectedTag) return questions;
  return questions.filter((question) =>
    question.topics.some((topic) => topic.tag === selectedTag)
  );
}

/**
 * 議員紹介・市長紹介で登録されている画像URLを、試作サンプルのアイコンへ割り当てる。
 */
export function attachPrototypeAvatars(
  questions: OitaGeneralQuestion[],
  councilorImages: (string | null | undefined)[],
  mayorImageUrl?: string | null
): OitaGeneralQuestion[] {
  const validCouncilors = councilorImages.filter(
    (url): url is string => typeof url === "string" && url.trim().length > 0
  );
  return questions.map((question, index) => {
    const questionerAvatar =
      validCouncilors.length > 0
        ? validCouncilors[index % validCouncilors.length]
        : null;
    return {
      ...question,
      avatarUrl: questionerAvatar,
      topics: question.topics.map((topic) => ({
        ...topic,
        exchanges: topic.exchanges.map((turn) => ({
          ...turn,
          avatarUrl:
            turn.speakerRole === "questioner"
              ? questionerAvatar
              : turn.speakerLabel === "市長"
                ? (mayorImageUrl ?? null)
                : null,
        })),
      })),
    };
  });
}

export function inferOitaQuestionCategory(text: string): string {
  if (/子育て|保育|学校|教育|通学|子ども|児童|給食/.test(text)) {
    return "子育て・教育";
  }
  if (/防災|避難|災害|消防|防犯|安全|救急|浸水/.test(text)) {
    return "安心・安全・防災";
  }
  if (/選挙|投票|議会|デジタル|DX|行政|窓口|情報公開/.test(text)) {
    return "まちの仕組み・選挙";
  }
  return "まちづくり・暮らし";
}

export type PrototypePoliticianRef = {
  id?: string | null;
  name?: string | null;
  image_url?: string | null;
};

export function mapSupabaseQuestionsToPrototype(
  rows: GeneralQuestion[],
  politicians: PrototypePoliticianRef[],
  mayorImageUrl?: string | null,
  sessionLabel = "大分市議会 一般質問（Supabase議事録）"
): OitaGeneralQuestion[] {
  return rows.map((row) => {
    const matchedPolitician = politicians.find(
      (p) =>
        (row.politician_id && p.id === row.politician_id) ||
        (p.name &&
          p.name.replace(/\s+/g, "") ===
            row.questioner_name.replace(/\s+/g, ""))
    );
    const questionerAvatar = matchedPolitician?.image_url ?? null;

    return {
      id: row.id,
      sessionLabel,
      sessionDayLabel: `第${row.session_day}日`,
      questionOrder: row.question_order,
      questionerName: row.questioner_name,
      faction: row.questioner_party ?? "会派未設定",
      avatarUrl: questionerAvatar,
      overview: row.summary ?? `${row.questioner_name}議員による一般質問です。`,
      minutesSummaryUrl: row.source_url ?? null,
      topics: row.topics.map((topic, index) => {
        const answererLabel = [topic.answerer_role, topic.answerer_name]
          .filter(Boolean)
          .join(" ")
          .trim();
        const isMayor = topic.answerer_role.includes("市長");

        return {
          id: `${row.id}-topic-${index + 1}`,
          title: topic.title,
          tag: inferOitaQuestionCategory(
            `${topic.title} ${topic.question_summary}`
          ),
          exchanges: [
            {
              id: `${row.id}-topic-${index + 1}-q`,
              speakerRole: "questioner",
              speakerLabel: row.questioner_name,
              turnType: "質問",
              summary: topic.question_summary,
              rawText: row.raw_text ?? topic.question_summary,
              avatarUrl: questionerAvatar,
            },
            {
              id: `${row.id}-topic-${index + 1}-a`,
              speakerRole: "executive",
              speakerLabel: answererLabel || "市当局",
              turnType: "答弁",
              summary: topic.answer_summary,
              rawText: row.answer_raw_text ?? topic.answer_summary,
              avatarUrl: isMayor ? (mayorImageUrl ?? null) : null,
            },
          ],
        };
      }),
    };
  });
}

const LIFE_RELATED_CATEGORIES = new Set([
  "子育て・教育",
  "まちづくり・暮らし",
  "安心・安全・防災",
]);

export function selectLifeRelatedQuestions(
  questions: OitaGeneralQuestion[],
  limit = 3
): OitaGeneralQuestion[] {
  const scored = questions.map((question, index) => {
    const categoryScore = question.topics.filter((topic) =>
      LIFE_RELATED_CATEGORIES.has(topic.tag)
    ).length;
    const text = `${question.overview} ${question.topics
      .map((t) => t.title)
      .join(" ")}`;
    const keywordScore =
      /保育|子育て|医療|交通|避難|防災|学校|福祉|公園|ごみ|暮らし|通学/.test(
        text
      )
        ? 1
        : 0;
    return { question, index, score: categoryScore * 2 + keywordScore };
  });

  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored.slice(0, limit).map((item) => item.question);
}
