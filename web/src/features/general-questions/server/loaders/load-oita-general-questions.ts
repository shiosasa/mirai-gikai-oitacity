import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import {
  mapSupabaseQuestionsToPrototype,
  type OitaGeneralQuestion,
  type PrototypeMeetingMeta,
  selectLifeRelatedQuestions,
} from "@/app/dev/features/general-questions/oita-prototype/_lib/oita-prototype-helpers";
import type { GeneralQuestion } from "@/features/general-questions/shared/types";
import { getCurrentMayor } from "@/features/politicians/server/loaders/get-current-mayor";
import { getPublishedPoliticians } from "@/features/politicians/server/loaders/get-published-politicians";

async function loadPublishedGeneralQuestions(
  limit: number,
  includeDrafts = false
): Promise<GeneralQuestion[]> {
  try {
    const supabase = createAdminClient();
    const { data: published } = await supabase
      .from("general_questions")
      .select("*")
      .eq("publish_status", "published")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (published && published.length > 0) {
      return published.map((row) => ({
        ...row,
        topics: Array.isArray(row.topics) ? row.topics : [],
      })) as GeneralQuestion[];
    }

    if (!includeDrafts) return [];

    const { data: latest } = await supabase
      .from("general_questions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!latest || latest.length === 0) return [];
    return latest.map((row) => ({
      ...row,
      topics: Array.isArray(row.topics) ? row.topics : [],
    })) as GeneralQuestion[];
  } catch {
    return [];
  }
}

async function loadSessionMetaBySourceUrl(
  questions: GeneralQuestion[]
): Promise<Record<string, PrototypeMeetingMeta>> {
  const urls = questions
    .map((q) => q.source_url)
    .filter((u): u is string => Boolean(u));
  if (urls.length === 0) return {};

  const sessionIds = urls
    .map((u) => {
      const m = u.match(/\/committees\/(?:committee|plenary)\/(\d+)\/(\d+)/);
      return m
        ? { url: u, meetingId: Number(m[1]), sessionId: Number(m[2]) }
        : null;
    })
    .filter((v): v is { url: string; meetingId: number; sessionId: number } =>
      Boolean(v)
    );
  if (sessionIds.length === 0) return {};

  try {
    const supabase = createAdminClient();
    const [{ data: sessions }, { data: meetings }] = await Promise.all([
      supabase
        .from("meeting_sessions")
        .select("id, meeting_id, date")
        .in(
          "id",
          sessionIds.map((s) => s.sessionId)
        ),
      supabase
        .from("meetings")
        .select("id, title")
        .in(
          "id",
          sessionIds.map((s) => s.meetingId)
        ),
    ]);

    const meetingTitleById = new Map(
      (meetings ?? []).map((m) => [m.id, m.title])
    );
    const sessionById = new Map((sessions ?? []).map((s) => [s.id, s]));

    const result: Record<string, PrototypeMeetingMeta> = {};
    for (const item of sessionIds) {
      const s = sessionById.get(item.sessionId);
      result[item.url] = {
        date: s?.date ?? null,
        meetingName: meetingTitleById.get(item.meetingId) ?? null,
      };
    }
    return result;
  } catch {
    return {};
  }
}

export async function loadOitaGeneralQuestions(options?: {
  limit?: number;
  lifeRelatedLimit?: number;
  includeDrafts?: boolean;
}): Promise<OitaGeneralQuestion[]> {
  const limit = options?.limit ?? 100;
  const includeDrafts = options?.includeDrafts ?? false;

  const [politicians, mayor, dbQuestions] = await Promise.all([
    getPublishedPoliticians().catch(() => []),
    getCurrentMayor().catch(() => null),
    loadPublishedGeneralQuestions(limit, includeDrafts),
  ]);

  const sessionMetaBySourceUrl = await loadSessionMetaBySourceUrl(dbQuestions);

  const mapped = mapSupabaseQuestionsToPrototype(
    dbQuestions,
    politicians,
    mayor?.image_url,
    undefined,
    sessionMetaBySourceUrl
  );

  if (options?.lifeRelatedLimit) {
    return selectLifeRelatedQuestions(mapped, options.lifeRelatedLimit);
  }
  return mapped;
}
