import type { MunicipalityConnection } from "@mirai-gikai/shared/interview/municipality-connection";

/** 1つのトピックス記事に「生の声」として掲載できる最大件数 */
export const TOPIC_VOICE_MAX_PER_TOPIC = 5;

export type TopicVoiceRow = {
  reportId: string;
  sessionId: string;
  billId: string;
  topicTitle: string;
  stance: string | null;
  role: string | null;
  roleTitle: string | null;
  municipalityConnection: MunicipalityConnection | null;
  summary: string | null;
  isPublicByUser: boolean;
  isPublicByAdmin: boolean;
  featuredAt: string | null;
  createdAt: string;
};

export type TopicVoiceGroup = {
  billId: string;
  topicTitle: string;
  featuredCount: number;
  reports: TopicVoiceRow[];
};

export function getTopicVoiceStatusLabel(
  report: Pick<
    TopicVoiceRow,
    "featuredAt" | "isPublicByUser" | "isPublicByAdmin"
  >
): string | null {
  if (!report.featuredAt) return null;
  return report.isPublicByUser && report.isPublicByAdmin
    ? "採用済み"
    : "採用済み（非公開）";
}

type RawTopicVoiceRow = {
  id: string;
  interview_session_id: string;
  stance: string | null;
  role: string | null;
  role_title: string | null;
  municipality_connection: MunicipalityConnection | null;
  summary: string | null;
  is_public_by_user: boolean;
  is_public_by_admin: boolean;
  topic_voice_featured_at: string | null;
  created_at: string;
  interview_sessions: unknown;
};

function firstOf<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

/**
 * Supabase のネストした結果（interview_sessions → interview_configs → bills）を平坦化する。
 * トピックに紐付かない行は null を返す。
 */
export function normalizeTopicVoiceRow(
  raw: RawTopicVoiceRow
): TopicVoiceRow | null {
  const session = firstOf(
    raw.interview_sessions as
      | { interview_configs: unknown }
      | { interview_configs: unknown }[]
      | null
  );
  const config = firstOf(
    session?.interview_configs as
      | { bill_id: string; bills: unknown }
      | { bill_id: string; bills: unknown }[]
      | null
  );
  const bill = firstOf(
    config?.bills as { name: string } | { name: string }[] | null
  );
  if (!config || !bill) return null;

  return {
    reportId: raw.id,
    sessionId: raw.interview_session_id,
    billId: config.bill_id,
    topicTitle: bill.name,
    stance: raw.stance,
    role: raw.role,
    roleTitle: raw.role_title,
    municipalityConnection: raw.municipality_connection,
    summary: raw.summary,
    isPublicByUser: raw.is_public_by_user,
    isPublicByAdmin: raw.is_public_by_admin,
    featuredAt: raw.topic_voice_featured_at,
    createdAt: raw.created_at,
  };
}

/**
 * トピックごとにまとめる。各トピック内は採用済み → 新しい回答の順。
 * トピック自体は最新の回答があるものから並べる。
 */
export function groupTopicVoicesByTopic(
  rows: TopicVoiceRow[]
): TopicVoiceGroup[] {
  const groups = new Map<string, TopicVoiceGroup>();
  for (const row of rows) {
    let group = groups.get(row.billId);
    if (!group) {
      group = {
        billId: row.billId,
        topicTitle: row.topicTitle,
        featuredCount: 0,
        reports: [],
      };
      groups.set(row.billId, group);
    }
    group.reports.push(row);
    if (row.featuredAt) group.featuredCount++;
  }

  const latest = (group: TopicVoiceGroup) =>
    Math.max(...group.reports.map((r) => Date.parse(r.createdAt)));

  for (const group of groups.values()) {
    group.reports.sort((a, b) => {
      if (Boolean(a.featuredAt) !== Boolean(b.featuredAt)) {
        return a.featuredAt ? -1 : 1;
      }
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
  }

  return [...groups.values()].sort((a, b) => latest(b) - latest(a));
}

/**
 * 「生の声」に採用できない理由を返す。採用できる場合は null。
 */
export function getTopicVoiceFeatureBlocker(
  candidate: Pick<TopicVoiceRow, "isPublicByUser" | "summary" | "featuredAt">,
  featuredCountInTopic: number,
  max: number = TOPIC_VOICE_MAX_PER_TOPIC
): string | null {
  if (!candidate.isPublicByUser) {
    return "回答者が公開に同意していないため採用できません";
  }
  if (!candidate.summary?.trim()) {
    return "要約がまだ生成されていないため採用できません";
  }
  if (!candidate.featuredAt && featuredCountInTopic >= max) {
    return `1つのトピックに採用できるのは${max}件までです`;
  }
  return null;
}
