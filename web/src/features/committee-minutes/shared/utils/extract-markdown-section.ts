/**
 * Markdown から指定した見出し（## 見出し）のセクションを切り出す。
 * - body: 見出し直下〜次の ## 見出しの手前までの本文（見出しが無い・本文が空なら null）
 * - rest: そのセクションを取り除いた残りの Markdown
 */
export function extractMarkdownSection(
  markdown: string,
  heading: string
): { body: string | null; rest: string } {
  const lines = markdown.split(/\r?\n/);
  const isH2 = (line: string) => /^##\s+/.test(line);
  const start = lines.findIndex(
    (line) => isH2(line) && line.replace(/^##\s+/, "").trim() === heading
  );
  if (start === -1) return { body: null, rest: markdown };

  const nextOffset = lines.slice(start + 1).findIndex(isH2);
  const end = nextOffset === -1 ? lines.length : start + 1 + nextOffset;
  const body = lines
    .slice(start + 1, end)
    .join("\n")
    .trim();
  const rest = [...lines.slice(0, start), ...lines.slice(end)]
    .join("\n")
    .trim();
  return { body: body || null, rest };
}
