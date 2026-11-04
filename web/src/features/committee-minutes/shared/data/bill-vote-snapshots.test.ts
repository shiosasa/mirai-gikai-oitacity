import { describe, expect, it } from "vitest";
import { groupBillVotes } from "../utils/bill-votes";
import { BILL_VOTE_SNAPSHOTS } from "./bill-vote-snapshots";

describe("official bill vote snapshots", () => {
  it("records each bill's decision date from the official PDF section heading", () => {
    expect(BILL_VOTE_SNAPSHOTS).toHaveLength(34);
    for (const snapshot of BILL_VOTE_SNAPSHOTS) {
      expect(snapshot.decisionDate).toBe(
        snapshot.meeting === "令和8年第1回定例会" ? "2026-03-26" : "2026-06-26"
      );
    }
  });
  it("preserves the original four bills and uniquely identifies all 34 sources", () => {
    expect(
      BILL_VOTE_SNAPSHOTS.slice(0, 4).map((snapshot) => [
        snapshot.billId,
        snapshot.billNumber,
        snapshot.meeting,
        snapshot.sourcePage,
      ])
    ).toEqual([
      [
        "4f7f3efe-240d-4c3a-a40b-3943b6285a57",
        "議第1号",
        "令和8年第1回定例会",
        1,
      ],
      [
        "da00eb74-016a-4bed-9702-bfe0b485d473",
        "議第35号",
        "令和8年第1回定例会",
        3,
      ],
      [
        "2bfbc9be-5163-4e9f-871d-6c752f4d19f6",
        "議第73号",
        "令和8年第2回定例会",
        2,
      ],
      [
        "1a434248-b86d-4ba8-bb00-b450be8be7ec",
        "議第75号",
        "令和8年第2回定例会",
        1,
      ],
    ]);
    expect(new Set(BILL_VOTE_SNAPSHOTS.map((item) => item.billId)).size).toBe(
      34
    );
    for (const snapshot of BILL_VOTE_SNAPSHOTS) {
      expect(new URL(snapshot.sourceUrl).hostname).toBe(
        "www.city.oita.oita.jp"
      );
      expect(snapshot.votes).toHaveLength(43);
      expect(
        new Set(snapshot.votes.map((vote) => vote.politicianId)).size
      ).toBe(43);
    }
  });

  it("records the budget vote for the whole budget, not the boar measure alone", () => {
    const snapshot = BILL_VOTE_SNAPSHOTS[0];
    const summary = groupBillVotes(snapshot.votes);
    expect(snapshot.targetTitle).toBe("令和8年度大分市一般会計予算");
    expect(snapshot.scopeNote).toContain("予算全体");
    expect([summary.forCount, summary.againstCount]).toEqual([40, 2]);
    expect(summary.entries.against).toEqual([
      { kind: "faction", faction: "日本共産党", count: 2 },
    ]);
    expect(
      snapshot.votes
        .filter((vote) => vote.result === "against")
        .map((vote) => vote.name)
    ).toEqual(["斉藤 由美子", "岩崎 貴博"]);
  });

  it("records the other three results as 42 in favor and none against", () => {
    for (const snapshot of BILL_VOTE_SNAPSHOTS.slice(1, 4)) {
      const summary = groupBillVotes(snapshot.votes);
      expect([summary.forCount, summary.againstCount]).toEqual([42, 0]);
      expect(summary.entries.for).toContainEqual({
        kind: "faction",
        faction: "日本共産党",
        count: 2,
      });
    }
  });

  it.each([
    ["6f59b59b-4bc4-4a15-a895-6af3b079b760", 2, 1, 1, 2],
    ["cb796842-2109-4772-8bc9-a74d5b2ffa78", 6, 1, 1, 0],
    ["596b332b-e866-45ab-94e6-e9af36d40368", 7, 1, 1, 0],
    ["e5bd2620-4154-4cdc-88aa-4f01f68480c8", 8, 1, 1, 2],
    ["4bcb032c-e8f7-4ece-8c0f-d2023187bbfa", 10, 1, 1, 2],
    ["a537a257-6829-417c-9c57-1bed1055e87f", 11, 1, 1, 2],
    ["33938ae5-84be-4739-9269-8642a1a58356", 12, 1, 1, 2],
    ["7b13d1a9-9d78-452b-9746-66ec5fa7958b", 13, 1, 1, 0],
    ["eb192eb5-362b-4b3a-94f7-9287230ee532", 14, 1, 1, 0],
    ["f5e79916-bed6-458f-b913-45a2dfd29d7d", 22, 1, 2, 0],
    ["f36b625b-ab1a-4ded-93f0-114526d1702c", 23, 1, 2, 0],
    ["609d7f8f-b055-48c3-af07-9921415b0e91", 24, 1, 2, 0],
    ["ad66a39c-9dbf-41ca-99b5-1868484a3afa", 25, 1, 2, 2],
    ["cad34975-2d2c-4389-bab4-2f14a164723c", 26, 1, 2, 2],
    ["e0e0d063-7433-4d8c-8b70-f59e2bc2e6d5", 29, 1, 2, 2],
    ["c3452338-d404-4fb8-a6ec-42e72ae82bfa", 30, 1, 2, 0],
    ["2ca10a05-08c3-4e62-8c3b-bc47e1614024", 34, 1, 3, 0],
    ["a6040e22-ef46-40a4-a5cc-d9a6d8af5324", 37, 1, 3, 2],
    ["e5372a7d-42c1-43f7-85c3-905223256eee", 51, 1, 4, 0],
    ["4e1bfd78-0696-49c7-8d7f-15ff632e074a", 53, 1, 4, 0],
    ["937e2287-0b63-420f-a870-08c7b8e7fc55", 57, 2, 1, 2],
    ["03d840d3-97c0-4a94-8f50-45808544c41c", 61, 2, 1, 2],
    ["b0e0ca0b-9101-4ec9-a645-ba02a7594237", 62, 2, 1, 2],
    ["b01b72cc-fa3a-4ad2-b2bc-aaf183ba321f", 63, 2, 1, 2],
    ["82aa4855-61da-46e3-b3ba-e4b9d575253e", 64, 2, 1, 2],
    ["5a1665bd-d5eb-4951-8694-208be8bbdbe9", 65, 2, 1, 0],
    ["5bc3bf4c-b731-445a-9e24-e8d83cca62c2", 66, 2, 1, 0],
    ["4216e079-74ac-47dd-9dea-0a3c4c9b9584", 69, 2, 1, 0],
    ["f4cde743-e242-4e15-b796-c097bbcfa572", 70, 2, 1, 2],
    ["a30606ad-4d61-4eb0-8323-de18b1423e24", 74, 2, 2, 0],
  ] as const)("matches the official vote and source page for %s", (billId, number, term, page, againstCount) => {
    const snapshot = BILL_VOTE_SNAPSHOTS.find(
      (snapshot) => snapshot.billId === billId
    );
    expect(snapshot).toBeDefined();
    if (!snapshot) throw new Error(`Missing vote: ${billId}`);
    expect(snapshot.billNumber).toBe(`議第${number}号`);
    expect(snapshot.meeting).toBe(`令和8年第${term}回定例会`);
    expect(snapshot.sourcePage).toBe(page);
    expect(snapshot.sourceUrl).toBe(
      term === 1
        ? "https://www.city.oita.oita.jp/o186/shigikai/kaiginokekka/documents/giketukekka.pdf"
        : "https://www.city.oita.oita.jp/o186/shigikai/kaiginokekka/documents/giketukekka2_1.pdf"
    );
    const summary = groupBillVotes(snapshot.votes);
    expect([summary.forCount, summary.againstCount]).toEqual([
      42 - againstCount,
      againstCount,
    ]);
    expect(
      snapshot.votes
        .filter((vote) => vote.result === "against")
        .map((vote) => [vote.name, vote.faction])
    ).toEqual(
      againstCount === 2
        ? [
            ["斉藤 由美子", "日本共産党"],
            ["岩崎 貴博", "日本共産党"],
          ]
        : []
    );
  });

  it("explains whole-bill votes for cards covering only one department", () => {
    const budget = BILL_VOTE_SNAPSHOTS.find(
      (snapshot) => snapshot.billId === "33938ae5-84be-4739-9269-8642a1a58356"
    );
    expect(budget?.targetTitle).toBe(
      "令和7年度大分市一般会計補正予算（第7号）"
    );
    expect(budget?.scopeNote).toContain("予算（第7号）全体");
    const fee = BILL_VOTE_SNAPSHOTS.find(
      (snapshot) => snapshot.billId === "f36b625b-ab1a-4ded-93f0-114526d1702c"
    );
    expect(fee?.targetTitle).toBe("大分市手数料条例の一部改正について");
    expect(fee?.scopeNote).toContain("改正全体");
  });

  it("separates the chair and links the independent member in every result", () => {
    for (const snapshot of BILL_VOTE_SNAPSHOTS) {
      const summary = groupBillVotes(snapshot.votes);
      expect(
        summary.entries.for
          .filter((entry) => entry.kind === "faction")
          .filter((entry) => entry.faction !== "日本共産党")
          .map((entry) => [entry.faction, entry.count])
      ).toEqual([
        ["自由民主党", 12],
        ["地域政党おおいた。", 2],
        ["ネットワークみらい", 10],
        ["Oita市民クラブ", 2],
        ["新市民クラブ", 7],
        ["公明党", 6],
      ]);
      expect(summary.unvoted).toEqual([
        {
          politicianId: "9ef161c1-c791-4a35-aa05-eabe91413435",
          name: "田島 寛信",
          faction: "自由民主党",
          result: "chair",
        },
      ]);
      expect(summary.entries.for).toContainEqual({
        kind: "faction",
        faction: "自由民主党",
        count: 12,
      });
      expect(summary.entries.for).toContainEqual({
        kind: "person",
        vote: {
          politicianId: "34583c8e-8c39-4671-b6e1-514f67e33afe",
          name: "高松 大樹",
          faction: null,
          result: "for",
        },
      });
    }
  });
});
