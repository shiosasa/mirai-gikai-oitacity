import { env } from "../env";
import { logger } from "../logger";

/**
 * Web側で定義されているキャッシュタグと同じ値
 * web/src/lib/cache-tags.ts と同期を保つこと
 */
export const WEB_CACHE_TAGS = {
  HOMEPAGE: "homepage",
  BILLS: "bills",
  COUNCIL_SESSIONS: "council-sessions",
  DIET_SESSIONS: "diet-sessions",
  INTERVIEW_CONFIGS: "interview-configs",
  POLITICIANS: "politicians",
} as const;

export type WebCacheTag = (typeof WEB_CACHE_TAGS)[keyof typeof WEB_CACHE_TAGS];

/**
 * Invalidate specific cache tags in the web application.
 * If no tags are specified, all caches are invalidated.
 */
export async function invalidateWebCache(
  tags?: WebCacheTag[]
): Promise<boolean> {
  if (!env.webUrl || !env.revalidateSecret) {
    console.warn(
      "Web URL or revalidate secret not configured, skipping cache invalidation"
    );
    return false;
  }

  try {
    const response = await fetch(`${env.webUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.revalidateSecret}`,
      },
      body: tags ? JSON.stringify({ tags }) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Cache invalidation failed: ${response.status} ${errorText}`
      );
    }

    const result = await response.json();
    if (
      tags &&
      (!Array.isArray(result.tags) ||
        !tags.every((tag) => result.tags.includes(tag)))
    ) {
      throw new Error("Web did not acknowledge the requested cache tags");
    }
    logger.debug("Cache invalidated successfully:", result);
    return true;
  } catch (error) {
    console.error("Failed to invalidate web cache:", error);
    // Don't throw error to prevent breaking the main operation
    return false;
  }
}
