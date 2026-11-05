import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import { getMeetingBillFilter } from "@/features/bills/server/repositories/meeting-bill-filter";
import { applyMeetingBillFilter } from "@/features/bills/shared/utils/meeting-bill-filter";
import type {
  BillSearchResult,
  CommitteeSearchResult,
} from "../../shared/types/search-types";
import { toMeetingSearchResult } from "../../shared/utils/meeting-search-result";
import { buildSearchFilter } from "../../shared/utils/search-filter";

export async function searchBills(query: string): Promise<BillSearchResult[]> {
  const supabase = createAdminClient();
  const filter = await getMeetingBillFilter();
  const { data, error } = await applyMeetingBillFilter(
    supabase
      .from("bill_contents")
      .select(
        `
        title,
        summary,
        bills!inner (
          id,
          published_at,
          council_sessions (name),
          bills_tags (tags (label))
        )
      `
      )
      .eq("difficulty_level", "normal")
      .eq("bills.publish_status", "published"),
    filter,
    "bills."
  )
    .or(buildSearchFilter(["title", "summary", "content"], query))
    .order("bill_id")
    .limit(50);

  if (error) throw new Error(`Failed to search bills: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.bills.id,
    title: row.title,
    summary: row.summary,
    session: row.bills.council_sessions?.name ?? "",
    publishedAt: row.bills.published_at,
    tags: row.bills.bills_tags
      .map((item) => item.tags?.label)
      .filter((label): label is string => label != null),
  }));
}

export async function searchCommittees(
  query: string
): Promise<CommitteeSearchResult[]> {
  const supabase = createAdminClient();
  const { data: meetings, error: meetingsError } = await supabase
    .from("meetings")
    .select("id")
    .or(buildSearchFilter(["title"], query));
  if (meetingsError) {
    throw new Error(`Failed to search meetings: ${meetingsError.message}`);
  }
  const meetingIds = (meetings ?? []).map((meeting) => meeting.id);
  const conditions = [
    buildSearchFilter(
      ["session_title", "summary", "detailed_summary", "content", "decisions"],
      query
    ),
    ...(meetingIds.length ? [`meeting_id.in.(${meetingIds.join(",")})`] : []),
  ].join(",");
  const { data, error } = await supabase
    .from("meeting_sessions")
    .select(
      "id, session_title, date, summary, meetings!inner(id, title, meeting_type)"
    )
    .or(conditions)
    .order("date", { ascending: false })
    .order("id", { ascending: false })
    .limit(50);
  if (error) {
    throw new Error(`Failed to search meeting sessions: ${error.message}`);
  }

  return (data ?? []).map(toMeetingSearchResult);
}
