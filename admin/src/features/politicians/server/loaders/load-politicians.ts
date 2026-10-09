import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";

export async function loadPoliticiansForAdmin() {
  const supabase = createAdminClient();
  const [politiciansResult, factionsResult] = await Promise.all([
    supabase
      .from("politicians")
      .select("*")
      .order("name_kana", { ascending: true }),
    supabase
      .from("factions")
      .select("id, display_name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (politiciansResult.error) {
    throw new Error(
      `議員情報の取得に失敗しました: ${politiciansResult.error.message}`
    );
  }
  if (factionsResult.error) {
    throw new Error(
      `会派情報の取得に失敗しました: ${factionsResult.error.message}`
    );
  }

  return {
    politicians: politiciansResult.data ?? [],
    factions: factionsResult.data ?? [],
  };
}
