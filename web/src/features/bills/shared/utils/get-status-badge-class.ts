// GAS版の statusClass / ステータスラベルをバッジの背景色クラスに変換する
const CLASS_TO_BG: Record<string, string> = {
  "status-settled": "bg-oita-pink", // 予算可決・法案成立・計画承認
  "status-review": "bg-blue-500", // 審議中
  "status-discussions": "bg-amber-500", // 議会提言・審議中（旧表記）
  "status-before": "bg-gray-400", // 提出前
};

const LABEL_TO_CLASS: Record<string, string> = {
  予算可決: "status-settled",
  法案成立: "status-settled",
  計画承認: "status-settled",
  審議中: "status-review",
  議会提言: "status-discussions",
  提出前: "status-before",
};

const FALLBACK_BG = "bg-gray-500";

/**
 * ステータスバッジの背景色クラスを返す。
 * GAS由来の CSS クラス名（status-settled 等）とラベル文字列（予算可決 等）の両方を受け付ける。
 */
export function getStatusBadgeClass(value: string | null | undefined): string {
  if (!value) return FALLBACK_BG;
  const statusClass = CLASS_TO_BG[value] ? value : LABEL_TO_CLASS[value];
  return statusClass ? CLASS_TO_BG[statusClass] : FALLBACK_BG;
}
