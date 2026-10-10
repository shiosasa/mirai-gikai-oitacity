export type CouncilSchedule = {
  name: string;
  start_date: string;
  end_date: string | null;
};

export function selectCouncilSchedule(
  schedules: readonly CouncilSchedule[],
  now: Date
) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const currentSession =
    schedules
      .filter(
        (session) =>
          session.start_date <= today &&
          (session.end_date === null || today <= session.end_date)
      )
      .sort((a, b) => b.start_date.localeCompare(a.start_date))[0] ?? null;
  const nextSession =
    schedules
      .filter((session) => today < session.start_date)
      .sort((a, b) => a.start_date.localeCompare(b.start_date))[0] ?? null;
  return { currentSession, nextSession };
}
