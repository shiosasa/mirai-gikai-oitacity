import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { selectBillContent } from "../../../shared/utils/select-bill-content";
import { findBillContentByDifficulty } from "../../repositories/bill-repository";

/**
 * 指定された難易度の議案コンテンツを取得
 * @param billId 議案ID
 * @param difficultyLevel 難易度レベル
 */
export async function getBillContentWithDifficulty(
  billId: string,
  difficultyLevel: DifficultyLevelEnum
) {
  const levels: DifficultyLevelEnum[] =
    difficultyLevel === "hard" ? ["hard", "normal"] : ["normal"];
  const contents = await Promise.all(
    levels.map((level) => findBillContentByDifficulty(billId, level))
  );
  return selectBillContent(
    contents.filter((content) => content !== null),
    difficultyLevel
  );
}
