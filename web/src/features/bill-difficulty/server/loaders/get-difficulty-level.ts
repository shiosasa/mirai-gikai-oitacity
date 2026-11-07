import { cookies } from "next/headers";
import {
  DIFFICULTY_COOKIE_NAME,
  type DifficultyLevelEnum,
} from "../../shared/types";
import { parseDifficultyLevel } from "../../shared/utils/parse-difficulty-level";

/**
 * Middlewareが現在のURLから設定したリクエスト内の難易度を取得
 * Server Componentsから呼び出される読み取り専用の関数
 *
 * URLに ?difficulty=hard があるページだけ詳しく表示する。
 * ブラウザに保存された旧CookieはMiddlewareで上書きされる。
 */
export async function getDifficultyLevel(): Promise<DifficultyLevelEnum> {
  const cookieStore = await cookies();
  const difficulty = cookieStore.get(DIFFICULTY_COOKIE_NAME);
  return parseDifficultyLevel(difficulty?.value);
}
