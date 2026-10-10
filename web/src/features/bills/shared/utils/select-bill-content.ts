import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";

export function selectBillContent<
  T extends { difficulty_level: DifficultyLevelEnum },
>(contents: T[], difficulty: DifficultyLevelEnum): T | null {
  return (
    contents.find((content) => content.difficulty_level === difficulty) ??
    contents.find((content) => content.difficulty_level === "normal") ??
    null
  );
}
