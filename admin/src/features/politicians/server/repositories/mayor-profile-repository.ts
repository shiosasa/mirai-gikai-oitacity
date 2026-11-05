import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import type { MayorProfileInput } from "../../shared/utils/mayor-profile";

const profileColumns =
  "id,name,name_kana,birth_date,image_url,official_url,start_date,term_number,bio";

export async function findCurrentMayorForAdmin() {
  const { data, error } = await createAdminClient()
    .from("mayor_profile")
    .select(profileColumns)
    .eq("is_current", true)
    .maybeSingle();
  if (error) {
    throw new Error(`市長プロフィールの取得に失敗しました: ${error.message}`);
  }
  if (!data) {
    throw new Error(
      "現職の市長プロフィールが登録されていません。登録状態を確認してください。"
    );
  }
  return data;
}

export async function saveMayorProfile(input: MayorProfileInput) {
  const supabase = createAdminClient();
  const result = await supabase
    .from("mayor_profile")
    .update(input.content)
    .eq("id", input.id)
    .eq("is_current", true)
    .select(profileColumns)
    .maybeSingle();
  if (result.error) {
    throw new Error(
      `市長プロフィールの保存に失敗しました: ${result.error.message}`
    );
  }
  if (!result.data) {
    throw new Error(
      "市長情報が変更されたか、現職ではなくなりました。再読み込みして確認してください。"
    );
  }
  return result.data;
}
