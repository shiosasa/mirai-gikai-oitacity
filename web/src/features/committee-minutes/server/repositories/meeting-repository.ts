import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import { summarizeMeetingContent } from "../utils/summarize-with-ai";

export type SessionAttendees = {
  chair: string | null;
  vice_chair: string | null;
  members: string[];
  absent: string[];
  officials: string[];
};

export type SessionBill = {
  number: string | null;
  name: string;
  description: string | null;
  result: string | null;
};

type SessionRow = {
  id: number;
  meeting_id: number;
  session_title?: string;
  date?: string;
  content?: string | null;
  summary?: string | null;
  detailed_summary?: string | null;
  decisions?: string | null;
  attendees?: SessionAttendees | null;
  bills?: SessionBill[] | null;
};

type MeetingRow = {
  id: number;
  title: string;
  meeting_type: "本会議" | "委員会" | string;
  date: string;
  term: string;
  created_at: string;
  meeting_sessions?: SessionRow[];
};

export type MeetingSummary = {
  id: number;
  title: string;
  meetingType: "本会議" | "委員会";
  date: string;
  term: string;
  sessions: SessionRow[];
};

export type MeetingArchive = {
  id: number;
  title: string;
  meetingType: "本会議" | "委員会";
  term: string;
  sessionCount: number;
  latestSessionDate: string;
  date: string; // 元の会議日付
  sessions: SessionRow[]; // セッション情報を含める
};

function mapMeeting(row: MeetingRow): MeetingSummary {
  const firstSession = row.meeting_sessions?.[0];
  const targetDate = firstSession?.date || row.date || "";

  return {
    id: row.id,
    title: row.title ?? "",
    meetingType: row.meeting_type === "委員会" ? "委員会" : "本会議",
    date: targetDate,
    term: row.term ?? "",
    sessions: Array.isArray(row.meeting_sessions) ? row.meeting_sessions : [],
  };
}

function isMissingTableError(error: { code?: string | null }): boolean {
  return error.code === "42P01" || error.code === "PGRST205";
}

export async function findAllMeetings(): Promise<MeetingSummary[]> {
  try {
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("meetings")
      .select(
        "id, title, meeting_type, date, term, created_at, meeting_sessions (*)"
      )
      .order("date", { ascending: false })
      .order("date", { referencedTable: "meeting_sessions", ascending: true })
      .order("id", { referencedTable: "meeting_sessions", ascending: true });

    if (error) {
      console.warn(`Meetings query error: ${error.message}`);
      if (isMissingTableError(error)) return [];
      return [];
    }
    return (data ?? []).map((row: MeetingRow) => mapMeeting(row));
  } catch (err) {
    console.warn("Failed to fetch meetings:", err);
    return [];
  }
}

export type CommitteeListItem = {
  id: number;
  title: string;
};

export async function findCommitteeList(): Promise<CommitteeListItem[]> {
  try {
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("meetings")
      .select("id, title")
      .eq("meeting_type", "委員会")
      .order("id", { ascending: true });

    if (error) {
      console.warn(`Committee list query error: ${error.message}`);
      return [];
    }
    return (data ?? []) as CommitteeListItem[];
  } catch (err) {
    console.warn("Failed to fetch committee list:", err);
    return [];
  }
}

export function buildMeetingArchives(
  meetings: MeetingSummary[]
): Map<"本会議" | "委員会", MeetingArchive[]> {
  const byType = new Map<"本会議" | "委員会", MeetingArchive[]>();

  for (const meeting of meetings) {
    const type = meeting.meetingType;
    const list = byType.get(type) ?? [];

    const archive: MeetingArchive = {
      id: meeting.id,
      title: meeting.title,
      meetingType: meeting.meetingType,
      term: meeting.term,
      date: meeting.date,
      sessions: meeting.sessions,
      sessionCount: meeting.sessions.length,
      latestSessionDate:
        meeting.sessions.length > 0 && meeting.sessions[0].date
          ? meeting.sessions[0].date
          : meeting.date,
    };

    list.push(archive);
    byType.set(type, list);
  }

  return byType;
}
