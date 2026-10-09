"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@mirai-gikai/supabase";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";

export type SavePoliticianInput = {
  id?: string;
  name: string;
  name_kana: string;
  avatar_url: string | null;
  terms_count: number;
  faction_id: string | null;
  committee_names: string[];
  website_url: string | null;
  twitter_url: string | null;
  contact_info: string | null;
  bio: string | null;
  profile_source_url: string | null;
  is_published: boolean;
};

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export async function savePolitician(input: SavePoliticianInput) {
  try {
    await requireAdmin();

    if (!input.name.trim() || !input.name_kana.trim()) {
      return { error: "氏名とふりがなを入力してください" };
    }
    if (!Number.isInteger(input.terms_count) || input.terms_count < 0) {
      return { error: "当選回数は0以上の整数で入力してください" };
    }
    if (input.is_published) {
      if (!input.profile_source_url || !isHttpsUrl(input.profile_source_url)) {
        return { error: "公開するにはhttpsの公式プロフィール出典が必要です" };
      }
    }

    const supabase = createAdminClient();
    const payload = {
      name: input.name.trim(),
      name_kana: input.name_kana.trim(),
      avatar_url: input.avatar_url || null,
      terms_count: input.terms_count,
      faction_id: input.faction_id || null,
      committee_names: input.committee_names
        .map((name) => name.trim())
        .filter(Boolean),
      website_url: input.website_url || null,
      twitter_url: input.twitter_url || null,
      contact_info: input.contact_info || null,
      bio: input.bio || null,
      profile_source_url: input.profile_source_url || null,
      is_published: input.is_published,
      data_verified_at: input.is_published ? new Date().toISOString() : null,
    };

    const result = input.id
      ? await supabase
          .from("politicians")
          .update(payload)
          .eq("id", input.id)
          .select("id")
          .single()
      : await supabase
          .from("politicians")
          .insert(payload)
          .select("id")
          .single();

    if (result.error) {
      return { error: `議員情報の保存に失敗しました: ${result.error.message}` };
    }

    revalidatePath("/politicians");
    revalidatePath(`/politicians/${result.data.id}`);
    await invalidateWebCache();
    return { data: result.data };
  } catch (error) {
    console.error("Save politician error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "議員情報を保存できませんでした",
    };
  }
}
