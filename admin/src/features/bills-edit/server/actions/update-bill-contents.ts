"use server";

import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { createAdminClient } from "@mirai-gikai/supabase";
import { revalidatePath } from "next/cache";
import { recordId } from "@/features/content-management/shared/utils/content-input";
import {
  invalidateWebCache,
  WEB_CACHE_TAGS,
} from "@/lib/utils/cache-invalidation";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import {
  type BillContentsUpdateInput,
  billContentsUpdateSchema,
  type DifficultyLevel,
} from "../../shared/types/bill-contents";

export type UpdateBillContentsResult =
  | { success: true }
  | { success: false; error: string };

export async function updateBillContents(
  billId: string,
  input: BillContentsUpdateInput
): Promise<UpdateBillContentsResult> {
  try {
    // 管理者権限チェック
    await requireAdmin();
    recordId.parse(billId);

    // バリデーション
    const validatedData = billContentsUpdateSchema.parse(input);

    const values = (["normal", "hard"] as DifficultyLevel[]).map(
      (difficulty) => {
        const data = validatedData[difficulty];
        return {
          bill_id: billId,
          difficulty_level: difficulty,
          title: data.title,
          summary: data.summary,
          content: data.content,
          updated_at: new Date().toISOString(),
        };
      }
    );
    const { error } = await createAdminClient()
      .from("bill_contents")
      .upsert(values, { onConflict: "bill_id,difficulty_level" });
    if (error)
      throw new Error(`詳細本文を保存できませんでした: ${error.message}`);

    // web側のキャッシュを無効化
    await invalidateWebCache([WEB_CACHE_TAGS.BILLS]);
    revalidatePath(`/bills/${billId}/card/edit`);
    revalidatePath(`/bills/${billId}/contents/edit`);

    return { success: true };
  } catch (error) {
    console.error("Update bill contents error:", error);
    return {
      success: false,
      error: getErrorMessage(
        error,
        "議案コンテンツの更新中にエラーが発生しました"
      ),
    };
  }
}
