"use server";

import {
  type HomepageRecord,
  parseHomepageContent,
  parseHomepageRevision,
} from "@mirai-gikai/shared/homepage/content";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import {
  invalidateWebCache,
  WEB_CACHE_TAGS,
} from "@/lib/utils/cache-invalidation";
import { saveHomepageForAdmin } from "../repositories/homepage-repository";

export async function saveHomepage(content: unknown, revision: unknown) {
  await requireAdmin();
  let data: HomepageRecord;
  try {
    data = await saveHomepageForAdmin(
      parseHomepageContent(content),
      parseHomepageRevision(revision)
    );
  } catch (error) {
    console.error("Save homepage error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "トップページを保存できませんでした",
    };
  }
  try {
    revalidatePath("/homepage");
    const invalidated = await invalidateWebCache([WEB_CACHE_TAGS.HOMEPAGE]);
    return {
      data,
      warning: invalidated
        ? undefined
        : "保存は完了しましたが、公開サイトのキャッシュ更新に失敗しました。接続設定と公開ページへの反映を確認してください。",
    };
  } catch (error) {
    console.error("Homepage cache update error:", error);
    return {
      data,
      warning:
        "保存は完了しましたが、画面の更新に失敗しました。再読み込みと公開ページの確認をお願いします。",
    };
  }
}
