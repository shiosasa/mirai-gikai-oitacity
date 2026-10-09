/**
 * 議員一覧の「会派別グループ表示」用ユーティリティ。
 *
 * 欠番レコード（name="欠番"）はリポジトリ側で除外済み。
 * ここではテキスト形式の会派（`faction`）でグルーピングし、
 * 会派内で議席番号（`number`）の昇順に整列。
 */

export type GroupablePolitician = {
  id?: string | null;
  name?: string | null;
  name_kana?: string | null;
  number?: number | null;
  faction?: string | null;
};

export type FactionGroup<T extends GroupablePolitician> = {
  /** React の key 用（会派名。未設定は "無所属"） */
  key: string;
  displayName: string;
  politicians: T[];
};

const INDEPENDENT_LABEL = "無所属";
const FACTION_ORDER: Record<string, number> = {
  自由民主党: 1,
  公明党: 2,
  日本共産党: 3,
  立憲民主党: 4,
  無所属: Number.MAX_SAFE_INTEGER,
};

/**
 * 表示に耐えるレコードかどうか。
 * id と name が存在していれば OK。
 */
export function isDisplayablePolitician<T extends GroupablePolitician>(
  politician: T | null | undefined
): politician is T {
  return Boolean(
    politician &&
      politician.id &&
      typeof politician.name === "string" &&
      politician.name.trim().length > 0
  );
}

/** 会派内の並び: 議席番号の若い順（null は末尾）、同番はふりがな順 */
function compareWithinFaction(a: GroupablePolitician, b: GroupablePolitician) {
  const numA = a.number ?? Number.MAX_SAFE_INTEGER;
  const numB = b.number ?? Number.MAX_SAFE_INTEGER;
  if (numA !== numB) return numA - numB;
  return (a.name_kana ?? "").localeCompare(b.name_kana ?? "", "ja");
}

/**
 * 会派ごとにグルーピングして返す。
 * - 無効レコードはスキップ
 * - 会派の並びは FACTION_ORDER 順（定義外は中間、無所属は末尾）
 * - 会派内は議席番号の若い順
 */
export function groupPoliticiansByFaction<T extends GroupablePolitician>(
  politicians: readonly (T | null | undefined)[]
): FactionGroup<T>[] {
  const groups = new Map<string, FactionGroup<T> & { sortOrder: number }>();

  for (const politician of politicians) {
    if (!isDisplayablePolitician(politician)) {
      continue;
    }

    const displayName = politician.faction?.trim() || INDEPENDENT_LABEL;
    const sortOrder =
      FACTION_ORDER[displayName] ??
      (displayName === INDEPENDENT_LABEL ? Number.MAX_SAFE_INTEGER : 999);

    const group = groups.get(displayName);
    if (group) {
      group.politicians.push(politician);
      group.sortOrder = Math.min(group.sortOrder, sortOrder);
    } else {
      groups.set(displayName, {
        key: displayName,
        displayName,
        sortOrder,
        politicians: [politician],
      });
    }
  }

  return [...groups.values()]
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder ||
        a.displayName.localeCompare(b.displayName, "ja")
    )
    .map(({ sortOrder: _sortOrder, ...group }) => ({
      ...group,
      politicians: [...group.politicians].sort(compareWithinFaction),
    }));
}
