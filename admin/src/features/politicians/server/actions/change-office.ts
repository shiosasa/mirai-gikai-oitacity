"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import {
  invalidateWebCache,
  WEB_CACHE_TAGS,
} from "@/lib/utils/cache-invalidation";
import { officeChangeSchema } from "../../shared/utils/office-change";
import { changeOffice } from "../repositories/office-history-repository";

export async function changeOfficeTerm(input: unknown) {
  await requireAdmin();
  const parsed = officeChangeSchema.safeParse(input);
  if (!parsed.success)
    return {
      error: parsed.error.issues.map((issue) => issue.message).join("、"),
    };
  try {
    const id = await changeOffice(parsed.data);
    revalidatePath("/office-history");
    revalidatePath("/mayor-profile");
    revalidatePath("/politicians");
    const invalidated = await invalidateWebCache([WEB_CACHE_TAGS.POLITICIANS]);
    return {
      data: { id },
      warning: invalidated
        ? undefined
        : "保存済みですが公開サイトのキャッシュ更新に失敗しました。公開表示を確認してください。",
    };
  } catch (error) {
    console.error("Change office term error:", error);
    return {
      error:
        error instanceof Error ? error.message : "任期を変更できませんでした",
    };
  }
}
