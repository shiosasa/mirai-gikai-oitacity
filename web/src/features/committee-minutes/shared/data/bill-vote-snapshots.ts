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

const FIRST_BUDGET_MARKS = [
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
    votes: expandBillVotes(ROSTER_2026, FIRST_BUDGET_MARKS),
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
];
