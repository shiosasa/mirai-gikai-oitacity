import { describe, expect, it } from "vitest";
import { parseCommitteeAssignments } from "./parse-committee-assignments";

describe("parseCommitteeAssignments", () => {
  it("単一の委員会名をそのまま返す", () => {
    expect(parseCommitteeAssignments("総務常任委員会")).toEqual([
      { label: "総務常任委員会", committeeName: "総務常任委員会" },
    ]);
  });

  it("役職サフィックスを除いた委員会名を取り出す", () => {
    expect(parseCommitteeAssignments("厚生常任委員会（委員長）")).toEqual([
      { label: "厚生常任委員会（委員長）", committeeName: "厚生常任委員会" },
    ]);
  });

  it("「、」区切りの複数委員会を分解する", () => {
    expect(
      parseCommitteeAssignments(
        "まちづくり推進特別委員会（委員長）、議会運営委員会"
      )
    ).toEqual([
      {
        label: "まちづくり推進特別委員会（委員長）",
        committeeName: "まちづくり推進特別委員会",
      },
      { label: "議会運営委員会", committeeName: "議会運営委員会" },
    ]);
  });

  it("null・空文字は空配列を返す", () => {
    expect(parseCommitteeAssignments(null)).toEqual([]);
    expect(parseCommitteeAssignments("")).toEqual([]);
  });
});
