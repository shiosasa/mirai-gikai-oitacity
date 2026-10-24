import type { SessionBill } from "../types";

export type PublishedBill = {
  id: string;
  name: string;
  bill_number: string | null;
  sessionName: string | null;
  sessionStartDate: string | null;
  sessionEndDate: string | null;
};

export type TopicBillReference = {
  sessionId: number;
  billNumber: string | null;
  billName: string | null;
  billId: string;
};

function normalize(value: string): string {
  return value.normalize("NFKC").replace(/\s/g, "");
}

function normalizeBillNumber(value: string): string {
  const normalized = normalize(value).replace(
    /^(?:(?:令和|平成)(?:元|\d+)年度?|(?:19|20)\d{2}年度?)/,
    ""
  );
  const number = normalized.match(/^(?:議案第|議第|第)?(\d+)(?:号)?$/);
  return number ? String(Number(number[1])) : normalized;
}

function getYear(value: string | null | undefined): number | null {
  if (!value) return null;
  const normalized = normalize(value);
  const era = normalized.match(/(令和|平成)(元|\d+)年度?/);
  if (era) {
    const year = era[2] === "元" ? 1 : Number(era[2]);
    return year + (era[1] === "令和" ? 2018 : 1988);
  }
  const year = normalized.match(
    /(?:^|[^\d])((?:19|20)\d{2})(?:年|-\d{2}-\d{2}|$)/
  );
  return year ? Number(year[1]) : null;
}

export function linkSessionBills(
  sessionBills: SessionBill[],
  publishedBills: PublishedBill[],
  sessionName: string,
  sessionDate: string | undefined,
  _sessionId?: number,
  _topicReferences: TopicBillReference[] = [],
  meetingTerm?: string
): SessionBill[] {
  const meetingYear =
    getYear(sessionName) ?? getYear(meetingTerm) ?? getYear(sessionDate);

  return sessionBills.map((sessionBill) => {
    const normalizedNumber = sessionBill.number
      ? normalizeBillNumber(sessionBill.number)
      : null;
    const year = getYear(sessionBill.number) ?? meetingYear;
    const yearCandidates =
      year === null
        ? []
        : publishedBills.filter(
            (bill) =>
              (getYear(bill.bill_number) ??
                getYear(bill.sessionName) ??
                getYear(bill.sessionStartDate)) === year
          );
    if (normalizedNumber !== null) {
      const matches = yearCandidates.filter(
        (bill) =>
          bill.bill_number !== null &&
          normalizeBillNumber(bill.bill_number) === normalizedNumber
      );

      if (matches.length === 1) {
        const candidate = matches[0];
        const isBudget =
          normalizedNumber === "1" ||
          (candidate.name && candidate.name.includes("一般会計予算")) ||
          (sessionBill.name && sessionBill.name.includes("一般会計予算"));

        if (isBudget && sessionBill.name && candidate.name) {
          const normSession = normalize(sessionBill.name);
          const normCandidate = normalize(candidate.name);

          if (normSession !== normCandidate) {
            const extractSpec = (str: string) => {
              const m = str.match(/[（(]([^）)]+)[）)]/);
              return m ? m[1] : "";
            };
            const sSpec = extractSpec(normSession);
            const cSpec = extractSpec(normCandidate);

            if (sSpec || cSpec) {
              const isSpecCompatible =
                Boolean(sSpec && cSpec) &&
                (sSpec === cSpec ||
                  sSpec.includes(cSpec) ||
                  cSpec.includes(sSpec));
              if (!isSpecCompatible) {
                return {
                  ...sessionBill,
                  billId: null,
                };
              }
            }
          }
        }

        return {
          ...sessionBill,
          billId: candidate.id,
        };
      }

      return {
        ...sessionBill,
        billId: null,
      };
    }

    const dateCandidates = sessionDate
      ? publishedBills.filter(
          (bill) =>
            bill.sessionStartDate != null &&
            bill.sessionStartDate <= sessionDate &&
            (bill.sessionEndDate == null || sessionDate <= bill.sessionEndDate)
        )
      : [];
    const namedCandidates = publishedBills.filter(
      (bill) =>
        bill.sessionName != null &&
        normalize(bill.sessionName) === normalize(sessionName)
    );
    const sessionCandidates =
      dateCandidates.length > 0 ? dateCandidates : namedCandidates;
    const candidates = year !== null ? yearCandidates : sessionCandidates;
    const nameMatches = candidates.filter(
      (bill) => normalize(bill.name) === normalize(sessionBill.name)
    );

    return {
      ...sessionBill,
      billId: nameMatches.length === 1 ? nameMatches[0].id : null,
    };
  });
}
