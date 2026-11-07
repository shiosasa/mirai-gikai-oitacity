import {
  DEFAULT_DIFFICULTY,
  type DifficultyLevelEnum,
  VALID_DIFFICULTY_LEVELS,
} from "../types/index";

/**
 * URL・リクエスト内の値を難易度として解釈する。
 * 未指定や無効な値は簡単な説明を表示する。
 */
export function parseDifficultyLevel(
  cookieValue: string | null | undefined
): DifficultyLevelEnum {
  if (!cookieValue) {
    return DEFAULT_DIFFICULTY;
  }

  if (VALID_DIFFICULTY_LEVELS.includes(cookieValue as DifficultyLevelEnum)) {
    return cookieValue as DifficultyLevelEnum;
  }

  return DEFAULT_DIFFICULTY;
}
