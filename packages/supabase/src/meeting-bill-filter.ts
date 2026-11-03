import "server-only";

import {
  isMissingBillSourceColumn,
  type MeetingBillFilter,
} from "@mirai-gikai/shared/bills/meeting-bill-filter";
import { createAdminClient } from "./admin";

const RECHECK_INTERVAL_MS = 60_000;

let sourceColumnAvailable = false;
let fallbackCache: { filter: MeetingBillFilter; checkedAt: number } | null =
  null;

/**
 * 議案（source = 'meeting'）だけに絞る条件を返す。
 * マイグレーション（bills.source）適用前でも同じ住み分けで動くよう、
 * カラムが無ければ proposals と同名の bills を除外する条件に切り替える。
 */
export async function getMeetingBillFilter(): Promise<MeetingBillFilter> {
  if (sourceColumnAvailable) return { kind: "source" };
  if (
    fallbackCache &&
    Date.now() - fallbackCache.checkedAt < RECHECK_INTERVAL_MS
  ) {
    return fallbackCache.filter;
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("bills").select("source").limit(1);
  if (!error) {
    sourceColumnAvailable = true;
    fallbackCache = null;
    return { kind: "source" };
  }
  if (!isMissingBillSourceColumn(error)) {
    throw new Error(`Failed to check bill source: ${error.message}`);
  }

  const filter: MeetingBillFilter = {
    kind: "excludeNames",
    topicTitles: await findProposalTitles(),
  };
  fallbackCache = { filter, checkedAt: Date.now() };
  return filter;
}

/**
 * トピックス元データ（proposals）のタイトル一覧
 */
export async function findProposalTitles(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("proposals").select("title");
  if (error) {
    throw new Error(`Failed to fetch proposal titles: ${error.message}`);
  }
  return (data ?? [])
    .map((row) => row.title)
    .filter((title): title is string => Boolean(title));
}
