import type { DifficultyLevelEnum } from "../types";

export function buildDifficultyUrl(
  currentUrl: string,
  level: DifficultyLevelEnum
): string {
  const url = new URL(currentUrl);
  if (level === "hard") {
    url.searchParams.set("difficulty", "hard");
  } else {
    url.searchParams.delete("difficulty");
  }
  return url.toString();
}
