export function summarizeContent(
  content: string | null | undefined,
  maxLength: number = 200
): string {
  if (!content) return "";

  const text = content.trim();
  if (text.length <= maxLength) {
    return text;
  }

  const sentences = text.split("。");
  let summary = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (summary.length + trimmed.length + 1 <= maxLength) {
      summary += trimmed + "。";
    } else {
      if (summary.length > 0) {
        return summary;
      }
      return trimmed.substring(0, maxLength) + "...";
    }
  }

  return summary || text.substring(0, maxLength) + "...";
}
