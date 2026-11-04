import { describe, expect, it } from "vitest";
import type { MemberVote, VoteRosterGroup } from "../types/bill-vote";
import {
  expandBillVotes,
  getVotePersonHref,
  groupBillVotes,
} from "./bill-votes";

const roster: VoteRosterGroup[] = [
  {
    faction: "会派A",
    members: [
      { politicianId: "a", name: "議員 A" },
      { politicianId: "b", name: "議員 B" },
    ],
  },
  {
    faction: null,
    members: [{ politicianId: "c", name: "議員 C" }],
  },
];

function vote(
  name: string,
  faction: string | null,
  result: MemberVote["result"]
): MemberVote {
  return { politicianId: name, name, faction, result };
}

describe("expandBillVotes", () => {
  it("preserves each member's source faction and explicit result", () => {
    expect(expandBillVotes(roster, ["○×", "議"])).toEqual(
      [
        vote("議員 A", "会派A", "for"),
        vote("議員 B", "会派A", "against"),
        vote("議員 C", null, "chair"),
      ].map((item, index) => ({
        ...item,
        politicianId: ["a", "b", "c"][index],
      }))
    );
  });

  it("distinguishes absence, withdrawal, and exclusion from votes", () => {
    const members = ["欠席", "退席", "除外"].map((name) => ({
      politicianId: name,
      name,
    }));
    expect(
      expandBillVotes([{ faction: "会派", members }], ["欠退除"]).map(
        (item) => item.result
      )
    ).toEqual(["absent", "withdrawn", "excluded"]);
  });

  it("rejects incomplete or unrecognized source results", () => {
    expect(() => expandBillVotes(roster, ["○×"])).toThrow(
      "議決結果と会派の数が一致しません"
    );
    expect(() => expandBillVotes(roster, ["○", "議"])).toThrow(
      "議決結果と議員の数が一致しません"
    );
    expect(() => expandBillVotes(roster, ["○?", "議"])).toThrow(
      "不明な議決結果の記号"
    );
  });

  it("rejects duplicate IDs and missing names", () => {
    expect(() =>
      expandBillVotes(
        [
          {
            faction: "会派",
            members: [
              { politicianId: "a", name: "一人目" },
              { politicianId: "a", name: "二人目" },
            ],
          },
        ],
        ["○○"]
      )
    ).toThrow("議員が重複しています");
    expect(() =>
      expandBillVotes(
        [{ faction: null, members: [{ politicianId: null, name: " " }] }],
        ["○"]
      )
    ).toThrow("議員名が空です");
  });

  it("does not mistake an empty faction for confirmed independence", () => {
    expect(() =>
      expandBillVotes(
        [{ faction: "", members: [{ politicianId: "a", name: "議員" }] }],
        ["○"]
      )
    ).toThrow("会派名が空です");
  });
});

describe("groupBillVotes", () => {
  it("groups matching votes without treating the chair or absent members as voters", () => {
    const result = groupBillVotes([
      vote("A", "会派A", "for"),
      vote("B", "会派A", "for"),
      vote("C", "会派A", "chair"),
      vote("D", "会派A", "absent"),
      vote("E", null, "against"),
    ]);

    expect(result.forCount).toBe(2);
    expect(result.againstCount).toBe(1);
    expect(result.entries.for).toEqual([
      { kind: "faction", faction: "会派A", count: 2 },
    ]);
    expect(result.entries.against).toEqual([
      { kind: "person", vote: vote("E", null, "against") },
    ]);
    expect(result.unvoted.map((item) => item.result)).toEqual([
      "chair",
      "absent",
    ]);
  });

  it("shows individual names for split factions and both forms of independence", () => {
    const result = groupBillVotes([
      vote("A", "会派A", "for"),
      vote("B", "会派A", "against"),
      vote("C", "無所属", "for"),
      vote("D", null, "against"),
      vote("E", "会派B", "withdrawn"),
      vote("F", "会派B", "excluded"),
    ]);

    expect(result.entries.for).toEqual([
      { kind: "person", vote: vote("A", "会派A", "for") },
      { kind: "person", vote: vote("C", "無所属", "for") },
    ]);
    expect(result.entries.against).toEqual([
      { kind: "person", vote: vote("B", "会派A", "against") },
      { kind: "person", vote: vote("D", null, "against") },
    ]);
    expect(result.unvoted.map((item) => item.result)).toEqual([
      "withdrawn",
      "excluded",
    ]);
  });
});

describe("getVotePersonHref", () => {
  it("links only when the current profile identifies the same person", () => {
    const person = vote("田島 寛信", "会派", "chair");
    const profiles = new Map([["田島 寛信", "田島　寛信"]]);
    expect(getVotePersonHref(person, profiles)).toBe(
      `/politicians/${encodeURIComponent("田島 寛信")}`
    );
    expect(
      getVotePersonHref(person, new Map([["田島 寛信", "別の議員"]]))
    ).toBeNull();
    expect(getVotePersonHref(person, new Map())).toBeNull();
    expect(
      getVotePersonHref({ ...person, politicianId: null }, profiles)
    ).toBeNull();
  });
});
