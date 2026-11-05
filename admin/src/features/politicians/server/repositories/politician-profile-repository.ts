import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import type { PoliticianProfileInput } from "../../shared/utils/politician-profile";

export async function savePoliticianProfile(input: PoliticianProfileInput) {
  const supabase = createAdminClient();
  const { id, ...payload } = input;
  const result = id
    ? await supabase
        .from("politicians")
        .update(payload)
        .eq("id", id)
        .neq("name", "欠番")
        .select("id")
        .single()
    : await supabase.from("politicians").insert(payload).select("id").single();

  if (result.error) {
    throw new Error(`議員情報の保存に失敗しました: ${result.error.message}`);
  }
  return result.data;
}
