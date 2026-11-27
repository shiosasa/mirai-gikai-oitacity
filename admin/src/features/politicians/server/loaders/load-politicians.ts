import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";

function isMissingColumnError(error: { code?: string; message?: string }) {
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    /does not exist|schema cache/i.test(error.message ?? "")
  );
}

export async function loadPoliticiansForAdmin() {
  await requireAdmin();
  const supabase = createAdminClient();
  const politiciansResult = await supabase
    .from("politicians")
    .select(
      "id,name,name_kana,number,birth_date,election_count,faction,standing_committee,special_committee,address,contact,homepage,blog_url,sns_links,image_url,is_current"
    )
    .neq("name", "欠番")
    .order("number", { ascending: true })
    .order("name_kana", { ascending: true });

  if (
    politiciansResult.error &&
    isMissingColumnError(politiciansResult.error)
  ) {
    const fallback = await supabase
      .from("politicians")
      .select(
        "id,name,name_kana,number,birth_date,election_count,faction,standing_committee,special_committee,address,contact,homepage,image_url,is_current"
      )
      .neq("name", "欠番")
      .order("number", { ascending: true })
      .order("name_kana", { ascending: true });
    if (fallback.error) {
      throw new Error(
        `議員情報の取得に失敗しました: ${fallback.error.message}`
      );
    }
    return {
      politicians: fallback.data.map((row) => ({
        ...row,
        blog_url: null,
        sns_links: null,
      })),
    };
  }

  if (politiciansResult.error) {
    throw new Error(
      `議員情報の取得に失敗しました: ${politiciansResult.error.message}`
    );
  }
  return {
    politicians: politiciansResult.data,
  };
}
