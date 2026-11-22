export type CouncilActivityStatus = {
  kind: "active" | "closed";
  label: string;
};

export type SessionStatusOptions = {
  sessionStatusName?: string | null;
  sessionStatusStartDate?: string | null;
  sessionStatusEndDate?: string | null;
  sessionStatusCustomText?: string | null;
};

/**
 * 日本時間（JST）基準の YYYY-MM-DD 文字列を取得する純粋関数
 */
export function getJSTDateString(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * YYYY-MM-DD 文字列を M/D 形式（例: 11/30）に整形する純粋関数
 */
export function formatMonthDayShort(dateString: string): string {
  const parts = dateString.split("-");
  if (parts.length === 3) {
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!Number.isNaN(month) && !Number.isNaN(day)) {
      return `${month}/${day}`;
    }
  }
  return dateString;
}

/**
 * 会期名と開始日・終了日から「開会中」「閉会中」の活動ステータスを算出する純粋関数
 */
export function resolveCouncilActivityStatus(
  options: SessionStatusOptions,
  now: Date = new Date()
): CouncilActivityStatus {
  const customText = options.sessionStatusCustomText?.trim();
  const name = options.sessionStatusName?.trim() || "";
  const startDate = options.sessionStatusStartDate?.trim() || "";
  const endDate = options.sessionStatusEndDate?.trim() || null;

  const today = getJSTDateString(now);

  // 1. カスタム文言が直接入力されている場合
  if (customText) {
    const isActive =
      customText.includes("開会") ||
      customText.includes("会期中") ||
      (startDate !== "" &&
        today >= startDate &&
        (endDate === null || today <= endDate));
    return {
      kind: isActive ? "active" : "closed",
      label: customText,
    };
  }

  // 2. 会期情報（開始日と会期名）が入力されている場合
  if (startDate && name) {
    const rangeText = endDate
      ? `${formatMonthDayShort(startDate)}〜${formatMonthDayShort(endDate)}`
      : `${formatMonthDayShort(startDate)}〜`;

    // 会期中（開始日 <= 今日 <= 終了日）
    if (today >= startDate && (endDate === null || today <= endDate)) {
      return {
        kind: "active",
        label: `開会中（${name} ${rangeText}）`,
      };
    }

    // 会期前（今日 < 開始日）
    if (today < startDate) {
      return {
        kind: "closed",
        label: `閉会中（次回 ${name} ${rangeText}）`,
      };
    }

    // 会期後（今日 > 終了日）
    return {
      kind: "closed",
      label: `閉会中（${name}は閉会しました）`,
    };
  }

  // 3. 入力がない場合
  return {
    kind: "closed",
    label: "閉会中（次回定例会未定）",
  };
}
