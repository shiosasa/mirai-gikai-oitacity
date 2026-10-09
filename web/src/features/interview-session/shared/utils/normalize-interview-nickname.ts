export function normalizeInterviewNickname(value: string): string | null {
  const nickname = value.trim();
  if (!nickname) return null;
  return Array.from(nickname).slice(0, 24).join("");
}
