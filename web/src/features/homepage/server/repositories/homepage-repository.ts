import "server-only";
import {
  homepageDefaults,
  parseHomepageContent,
} from "@mirai-gikai/shared/homepage/content";
import { createAdminClient } from "@mirai-gikai/supabase";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

export const getHomepageContent = unstable_cache(
  async () => {
    const { data, error } = await createAdminClient()
      .from("homepage_content")
      .select("content")
      .eq("id", true)
      .maybeSingle();
    if (error)
      throw new Error(`トップページを取得できません: ${error.message}`);
    return data ? parseHomepageContent(data.content) : { ...homepageDefaults };
  },
  ["homepage-content-v1"],
  { tags: [CACHE_TAGS.HOMEPAGE], revalidate: 300 }
);
