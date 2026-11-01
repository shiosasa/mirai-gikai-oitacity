export type BillSource = "meeting" | "topic";

/**
 * 議案（source = 'meeting'）だけに絞る条件。
 * - source: bills.source カラムで絞る（マイグレーション適用後）
 * - excludeNames: カラム未適用の環境向け。proposals と同名の bills（トピックの受け皿）を除外する
 *   （マイグレーションの初期分類と同じルール）
 */
export type MeetingBillFilter =
  | { kind: "source" }
  | { kind: "excludeNames"; topicTitles: string[] };

type FilterableQuery<Q> = {
  eq(column: string, value: string): Q;
  not(column: string, operator: string, value: string): Q;
};

/**
 * PostgREST の in 演算子用リスト `("a","b")` を組み立てる。
 * カンマや括弧を含む値も扱えるよう、すべてダブルクォートで囲みエスケープする。
 */
export function buildPostgrestInList(values: string[]): string {
  const quoted = values.map(
    (value) => `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
  );
  return `(${quoted.join(",")})`;
}

/**
 * クエリを議案（source = 'meeting'）だけに絞る。
 * columnPrefix は埋め込みリソース経由で絞る場合に指定する（例: "bills."）。
 */
export function applyMeetingBillFilter<Q extends FilterableQuery<Q>>(
  query: Q,
  filter: MeetingBillFilter,
  columnPrefix = ""
): Q {
  if (filter.kind === "source") {
    return query.eq(`${columnPrefix}source`, "meeting");
  }
  if (filter.topicTitles.length === 0) return query;
  return query.not(
    `${columnPrefix}name`,
    "in",
    buildPostgrestInList(filter.topicTitles)
  );
}

/**
 * bills.source カラムが未適用の環境で、名前から由来を補う。
 */
export function deriveBillSource(
  name: string,
  topicTitles: ReadonlySet<string>
): BillSource {
  return topicTitles.has(name) ? "topic" : "meeting";
}
