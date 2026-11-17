export type OfficeTerm = {
  id: number;
  role: string;
  politician_id: string | null;
  mayor_id: number | null;
  started_on: string | null;
  ended_on: string | null;
  term_number: number | null;
  seat_number: number | null;
  faction: string | null;
  standing_committee: string | null;
  special_committee: string | null;
  source_url: string | null;
  ended_source_url: string | null;
};

export function belongsToMayor(
  date: string | null,
  mayorId: number,
  terms: OfficeTerm[]
): boolean {
  if (!date) return false;
  const matches = terms.filter(
    (term) =>
      term.role === "mayor" &&
      term.started_on !== null &&
      date >= term.started_on &&
      (term.ended_on === null || date <= term.ended_on)
  );
  // Never attribute undated, unknown-start or ambiguous material to a new mayor.
  return matches.length === 1 && matches[0].mayor_id === mayorId;
}

export function formatOfficeTerm(term: OfficeTerm): string {
  return `${term.started_on ?? "就任日未確認"} ～ ${term.ended_on ?? "在任中"}${
    term.term_number === null ? "" : `（${term.term_number}期目）`
  }`;
}
