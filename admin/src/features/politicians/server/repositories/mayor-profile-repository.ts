import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import type { MayorProfileInput } from "../../shared/utils/mayor-profile";

const profileColumns =
  "id,name,name_kana,birth_date,image_url,official_url,start_date,term_number,bio";

export async function listMayorsForAdmin() {
  const { data, error } = await createAdminClient()
    .from("mayor_profile")
    .select("id,name,is_current")
    .order("id");
  if (error) throw new Error(`市長一覧を取得できません: ${error.message}`);
  return data;
}

export async function findMayorForAdmin(id: number) {
  const { data, error } = await createAdminClient()
    .from("mayor_profile")
    .select(profileColumns)
    .eq("id", id)
    .single();
  if (error)
    throw new Error(`市長プロフィールを取得できません: ${error.message}`);
  return data;
}

export async function saveMayorProfile(input: MayorProfileInput) {
  const supabase = createAdminClient();
  const { start_date, term_number, ...content } = input.content;
  if (input.id) {
    const existing = await findMayorForAdmin(input.id);
    if (
      existing.start_date !== start_date ||
      existing.term_number !== term_number
    ) {
      throw new Error("就任日・期数は「交代と任期履歴」で変更してください");
    }
  } else if (start_date !== null || term_number !== null) {
    throw new Error(
      "新規登録後に「交代と任期履歴」で就任日・期数を登録してください"
    );
  }
  const result = input.id
    ? await supabase
        .from("mayor_profile")
        .update(content)
        .eq("id", input.id)
        .select(profileColumns)
        .maybeSingle()
    : await supabase
        .from("mayor_profile")
        .insert({ ...content, is_current: false })
        .select(profileColumns)
        .single();
  if (result.error) {
    throw new Error(
      `市長プロフィールの保存に失敗しました: ${result.error.message}`
    );
  }
  if (!result.data) {
    throw new Error(
      "市長情報が見つかりません。再読み込みして確認してください。"
    );
  }
  return result.data;
}
