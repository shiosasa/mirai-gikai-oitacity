import type { PublicationType, RecentPublications } from "../types";

export const NEW_POST_DURATION_MS = 14 * 24 * 60 * 60 * 1000;

export function isNewPublication(
  firstPublishedAt: string | null | undefined,
  now: number
): boolean {
  if (!firstPublishedAt || !Number.isFinite(now)) return false;
  const publishedAt = Date.parse(firstPublishedAt);
  return (
    Number.isFinite(publishedAt) &&
    publishedAt <= now &&
    now < publishedAt + NEW_POST_DURATION_MS
  );
}

export function publicationKey(
  contentType: PublicationType,
  contentId: string | number
): string {
  return `${contentType}:${contentId}`;
}

export function getNewPublicationState(
  publications: RecentPublications["publications"],
  now: number
): { activeKeys: ReadonlySet<string>; nextExpiry: number | null } {
  const activeKeys = new Set<string>();
  let nextExpiry: number | null = null;
  for (const entry of publications) {
    if (!isNewPublication(entry.first_published_at, now)) continue;
    activeKeys.add(publicationKey(entry.content_type, entry.content_id));
    const expiry = Date.parse(entry.first_published_at) + NEW_POST_DURATION_MS;
    nextExpiry = nextExpiry === null ? expiry : Math.min(nextExpiry, expiry);
  }
  return { activeKeys, nextExpiry };
}
