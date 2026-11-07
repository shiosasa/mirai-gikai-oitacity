"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import {
  invalidateWebCache,
  WEB_CACHE_TAGS,
} from "@/lib/utils/cache-invalidation";
import { politicianProfileSchema } from "../../shared/utils/politician-profile";
import { savePoliticianProfile } from "../repositories/politician-profile-repository";

export async function savePolitician(input: unknown) {
  await requireAdmin();
  const parsed = politicianProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues.map((issue) => issue.message).join("、"),
    };
  }

  try {
    const data = await savePoliticianProfile(parsed.data);
    revalidatePath("/politicians");
    revalidatePath(`/politicians/${data.id}`);
    const invalidated = await invalidateWebCache([WEB_CACHE_TAGS.POLITICIANS]);
    return {
      data,
      warning: invalidated
        ? undefined
        : "保存は完了しましたが、公開サイトのキャッシュ更新に失敗しました。接続設定を確認し、公開ページの反映を確認してください。",
    };
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
