/** 整形済み議事録の1行 */
export type MinutesLine = {
  /** 発言者行（「○仲道委員長」など）かどうか */
  isSpeaker: boolean;
  text: string;
};

/**
 * 議事録原文を画面表示用に整形する。
 * 原文には紙面レイアウト由来の装飾が残っているため、以下を行う:
 * - 行頭の字下げスペース（全角・半角）を除去
 * - 中央寄せ・桁揃え用の連続全角スペースを1つに圧縮
 * - 3行以上連続する空行を1行にまとめる
 */
export function formatMinutesContent(content: string): MinutesLine[] {
  const lines: MinutesLine[] = [];
  let pendingBlank = false;

  for (const raw of content.split("\n")) {
    const text = raw
      .replace(/^[\s　]+/, "")
      .replace(/[\s　]+$/, "")
      .replace(/　{2,}/g, "　");

    if (text === "") {
      pendingBlank = lines.length > 0;
      continue;
    }

    if (pendingBlank) {
      lines.push({ isSpeaker: false, text: "" });
      pendingBlank = false;
    }

    lines.push({ isSpeaker: /^[○◯◎]/.test(text), text });
  }

  return lines;
}
