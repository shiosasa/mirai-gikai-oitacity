import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import type { MayorConference } from "@/features/politicians/shared/types/mayor";
import { isMayorLocalPreviewEnabled } from "@/features/politicians/shared/utils/mayor-local-preview";

export async function findMayorConferences(): Promise<MayorConference[]> {
  const supabase = createAdminClient();
  const query = supabase
    .from("press_conferences")
    .select(
      "id, slug, title, held_at, youtube_url, status, press_conference_items (id, title, material_url, order_index, item_type, summary)"
    )
    .order("held_at", { ascending: false })
    .order("order_index", {
      referencedTable: "press_conference_items",
      ascending: true,
    });

  const { data, error } = isMayorLocalPreviewEnabled(process.env)
    ? await query.in("status", ["published", "draft"])
    : await query.eq("status", "published");

  if (error) {
    throw new Error(
      `Failed to fetch mayor press conferences: ${error.message}`
    );
  }

  return data ?? [];
}
