import { formatRoleLabel } from "@/features/interview-report/shared/constants";
import type { TopicVoice } from "../types";

/** 1つのトピックス記事に掲載する「生の声」の最大件数（admin 側と同じ値） */
export const TOPIC_VOICE_MAX_PER_TOPIC = 5;

export type FeaturedVoiceRow = {
  id: string;
  billId: string;
  stance: string | null;
  role: string | null;
  roleTitle: string | null;
  summary: string | null;
  featuredAt: string;
};

/**
 * 採用済みの回答をトピック受け皿（bills.id）ごとにまとめる。
 * 採用した順に並べ、要約が空のものは除き、上限件数で切る。
 */
export function groupTopicVoicesByBillId(
  rows: FeaturedVoiceRow[],
  max: number = TOPIC_VOICE_MAX_PER_TOPIC
): Map<string, TopicVoice[]> {
  const sorted = [...rows].sort(
    (a, b) => Date.parse(a.featuredAt) - Date.parse(b.featuredAt)
  );
  const result = new Map<string, TopicVoice[]>();
  for (const row of sorted) {
    const summary = row.summary?.trim();
    if (!summary) continue;
    const voices = result.get(row.billId) ?? [];
    if (voices.length >= max) continue;
    voices.push({
      reportId: row.id,
      stance: row.stance,
      roleLabel: formatRoleLabel(row.role, row.roleTitle),
      summary,
    });
    result.set(row.billId, voices);
  }
  return result;
}
