"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import {
  invalidateWebCache,
  WEB_CACHE_TAGS,
} from "@/lib/utils/cache-invalidation";
import { mayorProfileInputSchema } from "../../shared/utils/mayor-profile";
import { saveMayorProfile as saveProfile } from "../repositories/mayor-profile-repository";

export async function saveMayorProfile(input: unknown) {
  await requireAdmin();
  const parsed = mayorProfileInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues.map((issue) => issue.message).join("、"),
    };
  }
  try {
    const data = await saveProfile(parsed.data);
    revalidatePath("/mayor-profile");
    const invalidated = await invalidateWebCache([WEB_CACHE_TAGS.POLITICIANS]);
    return {
      data,
      warning: invalidated
        ? undefined
        : "保存は完了しましたが、公開サイトのキャッシュ更新に失敗しました。接続設定と公開ページへの反映を確認してください。",
    };
  } catch (error) {
    console.error("Save mayor profile error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "市長情報を保存できませんでした",
    };
  }
}
