import "server-only";
import {
  type HomepageContent,
  type HomepageRecord,
  homepageDefaults,
  parseHomepageContent,
  parseHomepageRevision,
} from "@mirai-gikai/shared/homepage/content";
import { createAdminClient } from "@mirai-gikai/supabase";

export async function getHomepageForAdmin(): Promise<HomepageRecord> {
  const { data, error } = await createAdminClient()
    .from("homepage_content")
    .select("content,revision")
    .eq("id", true)
    .maybeSingle();
  if (error) throw new Error(`トップページを取得できません: ${error.message}`);
  return data
    ? {
        content: parseHomepageContent(data.content),
        revision: parseHomepageRevision(data.revision),
      }
    : { content: { ...homepageDefaults }, revision: 0 };
}

export async function saveHomepageForAdmin(
  content: HomepageContent,
  revision: number
): Promise<HomepageRecord> {
  const { data, error } = await createAdminClient().rpc(
    "save_admin_homepage_content",
    {
      content_input: content,
      expected_revision: revision,
    }
  );
  if (error) throw new Error(`トップページを保存できません: ${error.message}`);
  return { content, revision: parseHomepageRevision(data) };
}
