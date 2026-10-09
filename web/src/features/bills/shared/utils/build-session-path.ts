import type { TopicSourceRef } from "../types";

/**
 * 裏付け参照からセッション詳細ページのパスを組み立てる。
 * 本会議 → /committees/plenary/{meeting_id}/{session_id}
 * 委員会 → /committees/committee/{meeting_id}/{session_id}
 */
export function buildSessionPath(
  ref: Pick<TopicSourceRef, "meeting_type" | "meeting_id" | "session_id">
): string {
  const base =
    ref.meeting_type === "本会議"
      ? "/committees/plenary"
      : "/committees/committee";
  return `${base}/${ref.meeting_id}/${ref.session_id}`;
}
