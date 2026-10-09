export type CommitteeAssignment = {
  /** 表示用のテキスト（役職サフィックスを含む。例: 総務常任委員会（委員長）） */
  label: string;
  /** 役職サフィックスを除いた委員会名（例: 総務常任委員会） */
  committeeName: string;
};

/**
 * 議員の所属委員会文字列を分解する。
 * 例: 「まちづくり推進特別委員会（委員長）、議会運営委員会」
 *   → [{ label: "まちづくり推進特別委員会（委員長）", committeeName: "まちづくり推進特別委員会" },
 *      { label: "議会運営委員会", committeeName: "議会運営委員会" }]
 */
export function parseCommitteeAssignments(
  value: string | null | undefined
): CommitteeAssignment[] {
  if (!value) return [];

  return value
    .split("、")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((label) => {
      const match = label.match(/^(.+?)(（[^（）]*）)?$/);
      return {
        label,
        committeeName: match ? match[1] : label,
      };
    });
}
