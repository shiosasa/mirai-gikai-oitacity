/**
 * 記事カテゴリ（article_category_enum または日本語バッジ）から表示用ラベルを取得する
 */
export function getCategoryLabel(
  categoryOrBadge: string | null | undefined
): string {
  if (!categoryOrBadge) return "子育て・教育";

  const labels: Record<string, string> = {
    childcare_education: "子育て・教育",
    safety_disaster: "安心・安全・防災",
    community_living: "まちづくり・暮らし",
    governance_election: "まちの仕組み・選挙",
  };

  return labels[categoryOrBadge] || categoryOrBadge;
}

/**
 * proposals の badge（日本語）を bill_articles の category enum 値に変換する
 */
export function categoryEnumFromBadge(
  badge: string | null | undefined
): string {
  if (!badge) return "childcare_education";

  const badgeToEnum: Record<string, string> = {
    "子育て・教育": "childcare_education",
    "安心・安全・防災": "safety_disaster",
    "まちづくり・暮らし": "community_living",
    "まちの仕組み・選挙": "governance_election",
  };

  return badgeToEnum[badge] || badge;
}
