import type { BillVoteSnapshot, VoteRosterGroup } from "../types/bill-vote";
import { expandBillVotes } from "../utils/bill-votes";

const ROSTER_2026: readonly VoteRosterGroup[] = [
  {
    faction: "自由民主党",
    members: [
      {
        politicianId: "1f85146d-e223-447a-af03-bd4aac5f3eb7",
        name: "大津 將嘉",
      },
      { politicianId: "e0489066-2024-4ef6-9daa-c6994b2a30f4", name: "平本 泉" },
      { politicianId: "2f684cbb-38b8-4bc7-8370-d01d2c0f99a8", name: "牧 貴宏" },
      { politicianId: "e03019f9-a267-460a-b4be-80c4a6e0ee0c", name: "進 義和" },
      {
        politicianId: "6d183392-cf98-4ea5-9e01-5b93a926efd8",
        name: "長野 辰生",
      },
      {
        politicianId: "3c553ee4-c325-4926-b3ca-57a0bb452b73",
        name: "倉掛 賢裕",
      },
      {
        politicianId: "9ef161c1-c791-4a35-aa05-eabe91413435",
        name: "田島 寛信",
      },
      { politicianId: "9f0f423b-4d90-41c3-a5cd-c8dd6392d7d2", name: "二宮 博" },
      {
        politicianId: "5d54492c-14e0-4840-8226-2fe8618d7653",
        name: "藤田 敬治",
      },
      {
        politicianId: "d8de338e-93c5-4bb8-902f-bf4eaeff0559",
        name: "永松 弘基",
      },
      {
        politicianId: "ccf8dbb3-e2d8-4498-bd70-d51a511ca597",
        name: "板倉 永紀",
      },
      {
        politicianId: "498b8bc5-6a6e-4b5d-9817-cf5814000907",
        name: "仲道 俊寿",
      },
      {
        politicianId: "96a10d8e-bc23-4159-ab7c-572f30f3d219",
        name: "秦野 恭義",
      },
    ],
  },
  {
    faction: "地域政党おおいた。",
    members: [
      {
        politicianId: "98703d7c-9254-459d-bbeb-29fa7b176ae2",
        name: "直野 里子",
      },
      {
        politicianId: "07bda618-fb52-4b95-9e2e-7222e1e97a8a",
        name: "衛藤 延洋",
      },
    ],
  },
  {
    faction: "日本共産党",
    members: [
      {
        politicianId: "1d0caba7-0399-4e6e-95ff-f2d467dd7f33",
        name: "斉藤 由美子",
      },
      {
        politicianId: "f66f8e2a-4f4c-4a18-8722-e116b8e6eef4",
        name: "岩崎 貴博",
      },
    ],
  },
  {
    faction: null,
    members: [
      {
        politicianId: "34583c8e-8c39-4671-b6e1-514f67e33afe",
        name: "高松 大樹",
      },
    ],
  },
  {
    faction: "ネットワークみらい",
    members: [
      {
        politicianId: "ea36ab46-9f32-42cc-8e00-a1071302c2f2",
        name: "成迫 研太",
      },
      {
        politicianId: "275a0962-5dad-480e-bcd6-3eb051d6a922",
        name: "野上 恵子",
      },
      {
        politicianId: "ad8d271f-8f86-4ab0-96d8-3812c9ca728f",
        name: "うつのみや 陽子",
      },
      {
        politicianId: "d6f19ad7-f6c0-4ac9-9a33-0f6aef6cf54c",
        name: "馬見塚 剛",
      },
      {
        politicianId: "6c3a7757-5eb3-485d-b9c5-113e5707bd5d",
        name: "甲斐 高之",
      },
      {
        politicianId: "8b188733-b850-4914-a912-4790610d0d48",
        name: "スカルリーパー・エイジ",
      },
      {
        politicianId: "cceca471-bc19-47b5-978e-e05e0ba3c330",
        name: "帆秋 誠悟",
      },
      {
        politicianId: "9fec18ed-3497-4c09-a468-656b4fc0fdca",
        name: "宮邉 和弘",
      },
      {
        politicianId: "d31c4b51-848b-4176-985b-1f3489ac18c3",
        name: "髙野 博幸",
      },
      {
        politicianId: "57e92d7b-2902-42e5-8acf-c664cac95f9d",
        name: "日小田 良二",
      },
    ],
  },
  {
    faction: "Oita市民クラブ",
    members: [
      {
        politicianId: "74f42ca3-5b4e-45b1-881e-408b1c0d69d5",
        name: "岩川 義枝",
      },
      {
        politicianId: "f2b14977-0536-4488-bd10-3c2b9f766c17",
        name: "野尻 哲雄",
      },
    ],
  },
  {
    faction: "新市民クラブ",
    members: [
      {
        politicianId: "8a0c57af-557a-4765-92ef-7f742cf56cd1",
        name: "吉川 直樹",
      },
      {
        politicianId: "08b73acb-aa4f-4c80-82df-4ddb40da4ea3",
        name: "阿部 邦彦",
      },
      { politicianId: "be0e56e8-8793-4906-b31e-e70496cd3f00", name: "堤 英貴" },
      { politicianId: "0d81ec15-c305-49d5-8944-a99e174f4ccb", name: "堀 嘉徳" },
      {
        politicianId: "e902a110-5fcd-4c29-aba8-4cc69bc51ac8",
        name: "大石 祥一",
      },
      {
        politicianId: "00c6ca5d-1d93-472d-9726-3ad693ec8e9e",
        name: "仲家 孝治",
      },
      {
        politicianId: "986b3470-d9c1-48b1-8b69-c387cc5f5bee",
        name: "高橋 弘巳",
      },
    ],
  },
  {
    faction: "公明党",
    members: [
      {
        politicianId: "7a4769d4-22e8-4566-9136-5262ccebf261",
        name: "安東 美奈子",
      },
      {
        politicianId: "ab9a8bd5-2fef-4ee8-b270-efee00663809",
        name: "平田 友章",
      },
      {
        politicianId: "2af7bf11-83f1-4be0-b8a2-4bc60b20f2cf",
        name: "橋本 敬広",
      },
      {
        politicianId: "fbe2bad2-099a-41ea-bf60-85f3f9047de0",
        name: "川邉 浩子",
      },
      { politicianId: "af288af9-7c0f-413b-9f44-5714ea851ecf", name: "国宗 浩" },
      {
        politicianId: "93778b21-b0de-44b9-aa8f-dad900005347",
        name: "今山 裕之",
      },
    ],
  },
];

const FIRST_SESSION_SOURCE =
  "https://www.city.oita.oita.jp/o186/shigikai/kaiginokekka/documents/giketukekka.pdf";
const SECOND_SESSION_SOURCE =
  "https://www.city.oita.oita.jp/o186/shigikai/kaiginokekka/documents/giketukekka2_1.pdf";

const COMMUNIST_OPPOSITION_MARKS = [
  "○○○○○○議○○○○○○",
  "○○",
  "××",
  "○",
  "○○○○○○○○○○",
  "○○",
  "○○○○○○○",
  "○○○○○○",
] as const;
const UNANIMOUS_MARKS = [
  "○○○○○○議○○○○○○",
  "○○",
  "○○",
  "○",
  "○○○○○○○○○○",
  "○○",
  "○○○○○○○",
  "○○○○○○",
] as const;

export const BILL_VOTE_SNAPSHOTS: readonly BillVoteSnapshot[] = [
  {
    billId: "4f7f3efe-240d-4c3a-a40b-3943b6285a57",
    billNumber: "議第1号",
    targetTitle: "令和8年度大分市一般会計予算",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 1,
    scopeNote:
      "イノシシ対策だけではなく、令和8年度の一般会計予算全体への賛否です。",
    votes: expandBillVotes(ROSTER_2026, COMMUNIST_OPPOSITION_MARKS),
  },
  {
    billId: "da00eb74-016a-4bed-9702-bfe0b485d473",
    billNumber: "議第35号",
    targetTitle: "大分市学校給食費の管理に関する条例の一部改正について",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 3,
    votes: expandBillVotes(ROSTER_2026, UNANIMOUS_MARKS),
  },
  {
    billId: "2bfbc9be-5163-4e9f-871d-6c752f4d19f6",
    billNumber: "議第73号",
    targetTitle: "市有財産の処分について（教育用タブレット端末）",
    meeting: "令和8年第2回定例会",
    sourceUrl: SECOND_SESSION_SOURCE,
    sourcePage: 2,
    votes: expandBillVotes(ROSTER_2026, UNANIMOUS_MARKS),
  },
  {
    billId: "1a434248-b86d-4ba8-bb00-b450be8be7ec",
    billNumber: "議第75号",
    targetTitle: "令和8年度大分市一般会計補正予算（第1号）",
    meeting: "令和8年第2回定例会",
    sourceUrl: SECOND_SESSION_SOURCE,
    sourcePage: 1,
    votes: expandBillVotes(ROSTER_2026, UNANIMOUS_MARKS),
  },
  {
    billId: "6f59b59b-4bc4-4a15-a895-6af3b079b760",
    billNumber: "議第2号",
    targetTitle: "令和8年度大分市国民健康保険特別会計予算",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 1,
    votes: expandBillVotes(ROSTER_2026, COMMUNIST_OPPOSITION_MARKS),
  },
  {
    billId: "cb796842-2109-4772-8bc9-a74d5b2ffa78",
    billNumber: "議第6号",
    targetTitle: "令和8年度大分市母子父子寡婦福祉資金貸付事業特別会計予算",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 1,
    votes: expandBillVotes(ROSTER_2026, UNANIMOUS_MARKS),
  },
  {
    billId: "596b332b-e866-45ab-94e6-e9af36d40368",
    billNumber: "議第7号",
    targetTitle: "令和8年度大分市介護保険特別会計予算",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 1,
    votes: expandBillVotes(ROSTER_2026, UNANIMOUS_MARKS),
  },
  {
    billId: "e5bd2620-4154-4cdc-88aa-4f01f68480c8",
    billNumber: "議第8号",
    targetTitle: "令和8年度大分市後期高齢者医療特別会計予算",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 1,
    votes: expandBillVotes(ROSTER_2026, COMMUNIST_OPPOSITION_MARKS),
  },
  {
    billId: "4bcb032c-e8f7-4ece-8c0f-d2023187bbfa",
    billNumber: "議第10号",
    targetTitle: "令和8年度大分市水道事業会計予算",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 1,
    votes: expandBillVotes(ROSTER_2026, COMMUNIST_OPPOSITION_MARKS),
  },
  {
    billId: "a537a257-6829-417c-9c57-1bed1055e87f",
    billNumber: "議第11号",
    targetTitle: "令和8年度大分市公共下水道事業会計予算",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 1,
    votes: expandBillVotes(ROSTER_2026, COMMUNIST_OPPOSITION_MARKS),
  },
  {
    billId: "33938ae5-84be-4739-9269-8642a1a58356",
    billNumber: "議第12号",
    targetTitle: "令和7年度大分市一般会計補正予算（第7号）",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 1,
    scopeNote:
      "農林水産部所管分だけではなく、一般会計補正予算（第7号）全体への賛否です。",
    votes: expandBillVotes(ROSTER_2026, COMMUNIST_OPPOSITION_MARKS),
  },
  {
    billId: "7b13d1a9-9d78-452b-9746-66ec5fa7958b",
    billNumber: "議第13号",
    targetTitle: "令和7年度大分市介護保険特別会計補正予算（第2号）",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 1,
    votes: expandBillVotes(ROSTER_2026, UNANIMOUS_MARKS),
  },
  {
    billId: "eb192eb5-362b-4b3a-94f7-9287230ee532",
    billNumber: "議第14号",
    targetTitle: "令和7年度大分市水道事業会計補正予算（第3号）",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 1,
    votes: expandBillVotes(ROSTER_2026, UNANIMOUS_MARKS),
  },
  {
    billId: "f5e79916-bed6-458f-b913-45a2dfd29d7d",
    billNumber: "議第22号",
    targetTitle:
      "特別職の職員で非常勤のものの報酬並びに費用弁償に関する条例の一部改正について",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 2,
    votes: expandBillVotes(ROSTER_2026, UNANIMOUS_MARKS),
  },
  {
    billId: "f36b625b-ab1a-4ded-93f0-114526d1702c",
    billNumber: "議第23号",
    targetTitle: "大分市手数料条例の一部改正について",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 2,
    scopeNote:
      "土木建築部関係だけではなく、手数料条例の一部改正全体への賛否です。",
    votes: expandBillVotes(ROSTER_2026, UNANIMOUS_MARKS),
  },
  {
    billId: "609d7f8f-b055-48c3-af07-9921415b0e91",
    billNumber: "議第24号",
    targetTitle: "大分市地域づくり推進基金条例の一部改正について",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 2,
    votes: expandBillVotes(ROSTER_2026, UNANIMOUS_MARKS),
  },
  {
    billId: "ad66a39c-9dbf-41ca-99b5-1868484a3afa",
    billNumber: "議第25号",
    targetTitle:
      "大分市特定教育・保育施設及び特定地域型保育事業の運営に関する基準を定める条例の一部改正について",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 2,
    votes: expandBillVotes(ROSTER_2026, COMMUNIST_OPPOSITION_MARKS),
  },
  {
    billId: "cad34975-2d2c-4389-bab4-2f14a164723c",
    billNumber: "議第26号",
    targetTitle:
      "大分市家庭的保育事業等の設備及び運営に関する基準を定める条例の一部改正について",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 2,
    votes: expandBillVotes(ROSTER_2026, COMMUNIST_OPPOSITION_MARKS),
  },
  {
    billId: "e0e0d063-7433-4d8c-8b70-f59e2bc2e6d5",
    billNumber: "議第29号",
    targetTitle: "大分市国民健康保険税条例の一部改正について",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 2,
    votes: expandBillVotes(ROSTER_2026, COMMUNIST_OPPOSITION_MARKS),
  },
  {
    billId: "c3452338-d404-4fb8-a6ec-42e72ae82bfa",
    billNumber: "議第30号",
    targetTitle: "大分市都市公園条例の一部改正について",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 2,
    votes: expandBillVotes(ROSTER_2026, UNANIMOUS_MARKS),
  },
  {
    billId: "2ca10a05-08c3-4e62-8c3b-bc47e1614024",
    billNumber: "議第34号",
    targetTitle: "大分市火災予防条例の一部改正について",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 3,
    votes: expandBillVotes(ROSTER_2026, UNANIMOUS_MARKS),
  },
  {
    billId: "a6040e22-ef46-40a4-a5cc-d9a6d8af5324",
    billNumber: "議第37号",
    targetTitle: "大分市障害者福祉手当条例の廃止について",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 3,
    votes: expandBillVotes(ROSTER_2026, COMMUNIST_OPPOSITION_MARKS),
  },
  {
    billId: "e5372a7d-42c1-43f7-85c3-905223256eee",
    billNumber: "議第51号",
    targetTitle:
      "工事委託契約の変更について（豊肥本線滝尾駅下郡信号場間都市計画道路片島松岡線Ｂｖ新設工事）",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 4,
    votes: expandBillVotes(ROSTER_2026, UNANIMOUS_MARKS),
  },
  {
    billId: "4e1bfd78-0696-49c7-8d7f-15ff632e074a",
    billNumber: "議第53号",
    targetTitle: "市道路線の認定について",
    meeting: "令和8年第1回定例会",
    sourceUrl: FIRST_SESSION_SOURCE,
    sourcePage: 4,
    votes: expandBillVotes(ROSTER_2026, UNANIMOUS_MARKS),
  },
  {
    billId: "937e2287-0b63-420f-a870-08c7b8e7fc55",
    billNumber: "議第57号",
    targetTitle:
      "大分市個人番号の利用及び特定個人情報の提供に関する条例の一部改正について",
    meeting: "令和8年第2回定例会",
    sourceUrl: SECOND_SESSION_SOURCE,
    sourcePage: 1,
    votes: expandBillVotes(ROSTER_2026, COMMUNIST_OPPOSITION_MARKS),
  },
  {
    billId: "03d840d3-97c0-4a94-8f50-45808544c41c",
    billNumber: "議第61号",
    targetTitle:
      "大分市幼稚園型認定こども園、保育所型認定こども園及び地方裁量型認定こども園の認定の要件を定める条例等の一部改正について",
    meeting: "令和8年第2回定例会",
    sourceUrl: SECOND_SESSION_SOURCE,
    sourcePage: 1,
    votes: expandBillVotes(ROSTER_2026, COMMUNIST_OPPOSITION_MARKS),
  },
  {
    billId: "b0e0ca0b-9101-4ec9-a645-ba02a7594237",
    billNumber: "議第62号",
    targetTitle:
      "大分市幼保連携型認定こども園の学級の編制、職員、設備及び運営に関する基準を定める条例等の一部改正について",
    meeting: "令和8年第2回定例会",
    sourceUrl: SECOND_SESSION_SOURCE,
    sourcePage: 1,
    votes: expandBillVotes(ROSTER_2026, COMMUNIST_OPPOSITION_MARKS),
  },
  {
    billId: "b01b72cc-fa3a-4ad2-b2bc-aaf183ba321f",
    billNumber: "議第63号",
    targetTitle:
      "大分市児童福祉施設の設備及び運営に関する基準を定める条例等の一部改正について",
    meeting: "令和8年第2回定例会",
    sourceUrl: SECOND_SESSION_SOURCE,
    sourcePage: 1,
    votes: expandBillVotes(ROSTER_2026, COMMUNIST_OPPOSITION_MARKS),
  },
  {
    billId: "82aa4855-61da-46e3-b3ba-e4b9d575253e",
    billNumber: "議第64号",
    targetTitle:
      "大分市家庭的保育事業等の設備及び運営に関する基準を定める条例等の一部改正について",
    meeting: "令和8年第2回定例会",
    sourceUrl: SECOND_SESSION_SOURCE,
    sourcePage: 1,
    votes: expandBillVotes(ROSTER_2026, COMMUNIST_OPPOSITION_MARKS),
  },
  {
    billId: "5a1665bd-d5eb-4951-8694-208be8bbdbe9",
    billNumber: "議第65号",
    targetTitle:
      "大分市乳児等通園支援事業の設備及び運営に関する基準を定める条例の一部改正について",
    meeting: "令和8年第2回定例会",
    sourceUrl: SECOND_SESSION_SOURCE,
    sourcePage: 1,
    votes: expandBillVotes(ROSTER_2026, UNANIMOUS_MARKS),
  },
  {
    billId: "5bc3bf4c-b731-445a-9e24-e8d83cca62c2",
    billNumber: "議第66号",
    targetTitle:
      "大分市児童福祉法に基づく指定通所支援の事業等の人員、設備及び運営に関する基準等を定める条例の一部改正について",
    meeting: "令和8年第2回定例会",
    sourceUrl: SECOND_SESSION_SOURCE,
    sourcePage: 1,
    votes: expandBillVotes(ROSTER_2026, UNANIMOUS_MARKS),
  },
  {
    billId: "4216e079-74ac-47dd-9dea-0a3c4c9b9584",
    billNumber: "議第69号",
    targetTitle: "大分市都市公園条例の一部改正について",
    meeting: "令和8年第2回定例会",
    sourceUrl: SECOND_SESSION_SOURCE,
    sourcePage: 1,
    votes: expandBillVotes(ROSTER_2026, UNANIMOUS_MARKS),
  },
  {
    billId: "f4cde743-e242-4e15-b796-c097bbcfa572",
    billNumber: "議第70号",
    targetTitle: "大分市立義務教育学校設置条例の一部改正について",
    meeting: "令和8年第2回定例会",
    sourceUrl: SECOND_SESSION_SOURCE,
    sourcePage: 1,
    votes: expandBillVotes(ROSTER_2026, COMMUNIST_OPPOSITION_MARKS),
  },
  {
    billId: "a30606ad-4d61-4eb0-8323-de18b1423e24",
    billNumber: "議第74号",
    targetTitle: "市道路線の認定について",
    meeting: "令和8年第2回定例会",
    sourceUrl: SECOND_SESSION_SOURCE,
    sourcePage: 2,
    votes: expandBillVotes(ROSTER_2026, UNANIMOUS_MARKS),
  },
];
