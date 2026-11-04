export function validateSpeechQuote(
  minutes: string | null,
  quote: string
): string | null {
  const content = minutes?.replace(/\r\n?/g, "\n");
  const excerpt = quote.replace(/\r\n?/g, "\n").trim();

  if (!content?.trim()) {
    return "選択した議事録に原文がありません";
  }
  if (!excerpt) {
    return "発言の引用を入力してください";
  }
  if (/(?:^|\n)[ \t　]*[○◯◎]/u.test(excerpt)) {
    return "発言者名を含めず、1人の発言を引用してください";
  }

  const first = content.indexOf(excerpt);
  if (first === -1) {
    return "引用が議事録の原文と一致しません。改行や空白も確認してください";
  }
  if (content.indexOf(excerpt, first + 1) !== -1) {
    return "同じ引用が議事録内に複数あります。発言を特定できる長さにしてください";
  }
  return null;
}
