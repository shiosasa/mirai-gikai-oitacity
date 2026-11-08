/**
 * お知らせの公開日時の変換・解決を行うユーティリティ
 */

/**
 * ISO日時文字列から <input type="date"> 用の YYYY-MM-DD 文字列（JST）を取得
 */
export function toInputDateValue(isoString?: string | null): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "";
    // JSTでフォーマット
    const formatter = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(date);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    if (year && month && day) {
      return `${year}-${month}-${day}`;
    }
  } catch {
    return "";
  }
  return "";
}

/**
 * フォーム入力からお知らせの published_at（ISO 8601文字列）を解決する
 * - 入力された日付（YYYY-MM-DD）がある場合: その日のJST午前0時（+09:00）のISO文字列
 * - 入力された日付がない場合:
 *   - 既存の published_at があればそれを維持
 *   - 既存がなければ現在日時（now）のISO文字列
 */
export function resolveInformationPublishedAt(
  inputDateString?: string | null,
  existingPublishedAt?: string | null,
  now: Date = new Date()
): string {
  const trimmed = inputDateString?.trim();
  if (trimmed && /^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    // JST午前0時 (00:00:00+09:00) のISO文字列を生成
    return `${trimmed}T00:00:00+09:00`;
  }

  if (existingPublishedAt?.trim()) {
    return existingPublishedAt;
  }

  return now.toISOString();
}
