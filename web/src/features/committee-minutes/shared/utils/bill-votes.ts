import type {
  BillVoteResult,
  DisplayVote,
  MemberVote,
  VoteRosterGroup,
} from "../types/bill-vote";

const MARK_RESULTS: Readonly<Record<string, BillVoteResult>> = {
  "○": "for",
  "×": "against",
  欠: "absent",
  退: "withdrawn",
  除: "excluded",
  議: "chair",
};

export function expandBillVotes(
  roster: readonly VoteRosterGroup[],
  marks: readonly string[]
): MemberVote[] {
  if (roster.length !== marks.length) {
    throw new Error("議決結果と会派の数が一致しません");
  }

  const votes: MemberVote[] = [];
  const politicianIds = new Set<string>();

  for (const [groupIndex, group] of roster.entries()) {
    if (group.faction !== null && !group.faction.trim()) {
      throw new Error("会派名が空です。無所属の場合はnullを使用してください");
    }
    const groupMarks = [...marks[groupIndex]];
    if (group.members.length !== groupMarks.length) {
      throw new Error("議決結果と議員の数が一致しません");
    }

    for (const [memberIndex, member] of group.members.entries()) {
      const result = MARK_RESULTS[groupMarks[memberIndex]];
      if (!result) {
        throw new Error(`不明な議決結果の記号: ${groupMarks[memberIndex]}`);
      }
      if (!member.name.trim()) {
        throw new Error("議員名が空です");
      }
      if (member.politicianId) {
        if (politicianIds.has(member.politicianId)) {
          throw new Error(`議員が重複しています: ${member.name}`);
        }
        politicianIds.add(member.politicianId);
      }
      votes.push({ ...member, faction: group.faction, result });
    }
  }

  return votes;
}

function isVoteCast(vote: MemberVote): vote is MemberVote & {
  result: "for" | "against";
} {
  return vote.result === "for" || vote.result === "against";
}

export function groupBillVotes(votes: readonly MemberVote[]) {
  const factionVotes = new Map<string, MemberVote[]>();
  const unvoted: MemberVote[] = [];
  let forCount = 0;
  let againstCount = 0;

  for (const vote of votes) {
    if (!isVoteCast(vote)) {
      unvoted.push(vote);
      continue;
    }
    if (vote.result === "for") forCount++;
    else againstCount++;
    if (vote.faction && vote.faction !== "無所属") {
      const members = factionVotes.get(vote.faction) ?? [];
      members.push(vote);
      factionVotes.set(vote.faction, members);
    }
  }

  const entries: Record<"for" | "against", DisplayVote[]> = {
    for: [],
    against: [],
  };
  const processedFactions = new Set<string>();

  for (const vote of votes) {
    if (!isVoteCast(vote)) continue;
    if (!vote.faction || vote.faction === "無所属") {
      entries[vote.result].push({ kind: "person", vote });
      continue;
    }
    if (processedFactions.has(vote.faction)) continue;
    processedFactions.add(vote.faction);
    const members = factionVotes.get(vote.faction);
    if (!members)
      throw new Error(`会派の投票が見つかりません: ${vote.faction}`);
    if (members.every((member) => member.result === vote.result)) {
      entries[vote.result].push({
        kind: "faction",
        faction: vote.faction,
        count: members.length,
      });
    } else {
      for (const member of members) {
        if (!isVoteCast(member)) {
          throw new Error(`投票していない議員が含まれています: ${member.name}`);
        }
        entries[member.result].push({ kind: "person", vote: member });
      }
    }
  }

  return { entries, forCount, againstCount, unvoted };
}

function normalizePersonName(name: string): string {
  return name.normalize("NFKC").replace(/\s/g, "");
}

export function getVotePersonHref(
  vote: MemberVote,
  profiles: ReadonlyMap<string, string>
): string | null {
  if (!vote.politicianId) return null;
  const profileName = profiles.get(vote.politicianId);
  if (
    !profileName ||
    normalizePersonName(profileName) !== normalizePersonName(vote.name)
  ) {
    return null;
  }
  return `/politicians/${encodeURIComponent(vote.politicianId)}`;
}
