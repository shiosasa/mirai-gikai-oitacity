import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";

export async function loadPoliticiansForAdmin() {
  await requireAdmin();
  const supabase = createAdminClient();
  const politiciansResult = await supabase
    .from("politicians")
    .select(
      "id,name,name_kana,number,birth_date,election_count,faction,standing_committee,special_committee,address,contact,homepage,image_url"
    )
    .neq("name", "欠番")
    .order("number", { ascending: true })
    .order("name_kana", { ascending: true });

  if (politiciansResult.error) {
    throw new Error(
      `議員情報の取得に失敗しました: ${politiciansResult.error.message}`
    );
  }
  return {
    politicians: politiciansResult.data,
  };
}
