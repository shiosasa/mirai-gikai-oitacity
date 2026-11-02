import { describe, expect, it } from "vitest";
import { groupBillVotes } from "../utils/bill-votes";
import { BILL_VOTE_SNAPSHOTS } from "./bill-vote-snapshots";

describe("official bill vote snapshots", () => {
  it("identifies each of the four bills and its source without duplicates", () => {
    expect(
      BILL_VOTE_SNAPSHOTS.map((snapshot) => [
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
      4
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
    for (const snapshot of BILL_VOTE_SNAPSHOTS.slice(1)) {
      const summary = groupBillVotes(snapshot.votes);
      expect([summary.forCount, summary.againstCount]).toEqual([42, 0]);
      expect(summary.entries.for).toContainEqual({
        kind: "faction",
        faction: "日本共産党",
        count: 2,
      });
    }
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
