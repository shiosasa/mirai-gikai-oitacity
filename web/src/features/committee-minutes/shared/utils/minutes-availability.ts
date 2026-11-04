export type SessionDisplayContent = {
  content?: string | null;
  summary?: string | null;
  detailed_summary?: string | null;
  decisions?: string | null;
  attendees?: object | null;
  bills?: readonly unknown[] | null;
};

export function hasMinutesContent(content: string | null | undefined): boolean {
  return Boolean(content?.trim());
}

export function isMeetingUpdating(
  sessions: readonly Pick<SessionDisplayContent, "content">[]
): boolean {
  return sessions.every((session) => !hasMinutesContent(session.content));
}

export function hasSessionDetails(session: SessionDisplayContent): boolean {
  return (
    [
      session.content,
      session.summary,
      session.detailed_summary,
      session.decisions,
    ].some(hasMinutesContent) ||
    Boolean(session.attendees) ||
    (session.bills?.length ?? 0) > 0
  );
}
