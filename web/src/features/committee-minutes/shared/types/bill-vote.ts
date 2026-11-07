export type BillVoteResult =
  | "for"
  | "against"
  | "absent"
  | "withdrawn"
  | "excluded"
  | "chair";

export type VoteMember = {
  politicianId: string | null;
  name: string;
};

export type VoteRosterGroup = {
  faction: string | null;
  members: readonly VoteMember[];
};

export type MemberVote = VoteMember & {
  faction: string | null;
  result: BillVoteResult;
};

export type BillVoteSnapshot = {
  billId: string;
  billNumber: string;
  targetTitle: string;
  meeting: string;
  sourceUrl: string;
  sourcePage: number;
  decisionDate?: string;
  scopeNote?: string;
  votes: readonly MemberVote[];
};

export type DisplayVote =
  | {
      kind: "faction";
      faction: string;
      count: number;
    }
  | {
      kind: "person";
      vote: MemberVote;
    };
