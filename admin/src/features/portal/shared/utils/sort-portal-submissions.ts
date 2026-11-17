export type SubmissionWithStatus = {
  status: "pending" | "approved" | "rejected" | string;
  created_at: string;
};

/**
 * 届いた申請・候補を、未対応（pending）を優先して上位に、
 * 対応済み（approved, rejected など）を下位に配置し、
 * 各グループ内では作成日時の新しい順（created_at 降順）に並べ替える。
 */
export function sortPortalSubmissions<T extends SubmissionWithStatus>(
  submissions: T[]
): T[] {
  return [...submissions].sort((a, b) => {
    const aPending = a.status === "pending";
    const bPending = b.status === "pending";

    // 1. 未対応（pending）を最優先
    if (aPending && !bPending) return -1;
    if (!aPending && bPending) return 1;

    // 2. 同じグループ内では作成日時の新しい順（降順）
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();

    if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
      return 0;
    }

    return bTime - aTime;
  });
}
