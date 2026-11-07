import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import { getMeetingBillFilter } from "@/features/bills/server/repositories/meeting-bill-filter";
import { applyMeetingBillFilter } from "@/features/bills/shared/utils/meeting-bill-filter";
import type {
  BillSearchResult,
  CommitteeSearchResult,
} from "../../shared/types/search-types";
import { buildBillSearchResults } from "../../shared/utils/bill-search-results";
import { loadSearchPages } from "../../shared/utils/load-search-pages";
import { toMeetingSearchResult } from "../../shared/utils/meeting-search-result";
import { buildSearchFilter } from "../../shared/utils/search-filter";

export async function searchBills(query: string): Promise<BillSearchResult[]> {
  const supabase = createAdminClient();
  const filter = await getMeetingBillFilter();
  const data = await loadSearchPages(async (from, to) => {
    const { data, error } = await applyMeetingBillFilter(
      supabase
        .from("bills")
        .select(
          `
          id, name, published_at,
          council_sessions (name),
          bills_tags (tags (label)),
          bill_contents (title, summary, content)
      `
        )
        .eq("bill_contents.difficulty_level", "normal")
        .eq("publish_status", "published"),
      filter
    )
      .order("id")
      .range(from, to);

    if (error) throw new Error(`Failed to search bills: ${error.message}`);
    return data ?? [];
  });

  return buildBillSearchResults(data, query);
}

export async function searchCommittees(
  query: string,
  sessionIds?: number[]
): Promise<CommitteeSearchResult[]> {
  if (sessionIds?.length === 0) return [];
  const supabase = createAdminClient();
  const meetings = await loadSearchPages(async (from, to) => {
    const { data, error } = await supabase
      .from("meetings")
      .select("id")
      .or(buildSearchFilter(["title"], query))
      .order("id")
      .range(from, to);
    if (error) {
      throw new Error(`Failed to search meetings: ${error.message}`);
    }
    return data ?? [];
  });
  const meetingIds = meetings.map((meeting) => meeting.id);
  const conditions = [
    buildSearchFilter(
      ["session_title", "summary", "detailed_summary", "content", "decisions"],
      query
    ),
    ...(meetingIds.length ? [`meeting_id.in.(${meetingIds.join(",")})`] : []),
  ].join(",");
  const data = await loadSearchPages(async (from, to) => {
    let request = supabase
      .from("meeting_sessions")
      .select(
        "id, session_title, date, summary, meetings!inner(id, title, meeting_type)"
      )
      .or(conditions);
    if (sessionIds) request = request.in("id", sessionIds);
    const { data, error } = await request
      .order("date", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to);
    if (error) {
      throw new Error(`Failed to search meeting sessions: ${error.message}`);
    }
    return data ?? [];
  });

  return data.map(toMeetingSearchResult);
}
