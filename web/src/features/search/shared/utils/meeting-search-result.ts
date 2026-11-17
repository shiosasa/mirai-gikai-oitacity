import { buildSessionPath } from "@mirai-gikai/shared/meetings/session-path";
import type { CommitteeSearchResult } from "../types/search-types";

type MeetingSearchRow = {
  id: number;
  session_title: string | null;
  date: string | null;
  summary: string | null;
  meetings: {
    id: number;
    title: string | null;
    meeting_type: string | null;
  };
};

export function toMeetingSearchResult(
  row: MeetingSearchRow
): CommitteeSearchResult {
  return {
    id: String(row.id),
    committeeName: row.meetings.title ?? "",
    href: buildSessionPath({
      meeting_type: row.meetings.meeting_type ?? "",
      meeting_id: row.meetings.id,
      session_id: row.id,
    }),
    title: row.session_title ?? row.meetings.title ?? "会議録",
    summary: row.summary,
    meetingDate: row.date ?? "",
    matchedTopics: [],
  };
}
