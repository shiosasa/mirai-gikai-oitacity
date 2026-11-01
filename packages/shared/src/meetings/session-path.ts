export function buildSessionPath(ref: {
  meeting_type: string;
  meeting_id: number;
  session_id: number;
}): string {
  const base =
    ref.meeting_type === "本会議"
      ? "/committees/plenary"
      : "/committees/committee";
  return `${base}/${ref.meeting_id}/${ref.session_id}`;
}
