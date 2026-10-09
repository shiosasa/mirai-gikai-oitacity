import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { CouncilSession } from "../../shared/types";
import { findNextCouncilSession } from "../repositories/council-session-repository";

export async function getNextCouncilSession(
  date: Date
): Promise<CouncilSession | null> {
  const targetDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replaceAll("/", "-");

  return _getCachedNextCouncilSession(targetDate);
}

const _getCachedNextCouncilSession = unstable_cache(
  async (targetDate: string): Promise<CouncilSession | null> => {
    return findNextCouncilSession(targetDate);
  },
  ["next-council-session"],
  {
    revalidate: 3600,
    tags: [CACHE_TAGS.COUNCIL_SESSIONS],
  }
);
