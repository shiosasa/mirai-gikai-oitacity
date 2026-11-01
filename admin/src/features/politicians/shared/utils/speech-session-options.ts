import { buildSessionPath } from "@mirai-gikai/shared/meetings/session-path";
import type { SpeechSession, SpeechSessionRow } from "../types/speech";

export function buildSpeechSessionOptions(rows: SpeechSessionRow[]) {
  const sessions: SpeechSession[] = [];
  const invalidIds: number[] = [];
  for (const row of rows) {
    const meeting = row.meetings;
    if (
      row.meeting_id === null ||
      !row.date ||
      !meeting?.title ||
      meeting.id !== row.meeting_id ||
      (meeting.meeting_type !== "本会議" && meeting.meeting_type !== "委員会")
    ) {
      invalidIds.push(row.id);
      continue;
    }
    sessions.push({
      id: row.id,
      meetingId: row.meeting_id,
      meetingType: meeting.meeting_type,
      meetingTitle: meeting.title,
      sessionTitle: row.session_title,
      date: row.date,
    });
  }
  return { sessions, invalidIds };
}

export function formatSpeechSession(session: SpeechSession): string {
  const title = session.sessionTitle ? `・${session.sessionTitle}` : "";
  return `${session.meetingTitle}（${session.date.replace(/-/g, "/")}）${title}`;
}

export function buildSpeechSessionUrl(
  webUrl: string,
  session: SpeechSession
): string {
  return `${webUrl.replace(/\/+$/, "")}${buildSessionPath({
    meeting_type: session.meetingType,
    meeting_id: session.meetingId,
    session_id: session.id,
  })}`;
}
