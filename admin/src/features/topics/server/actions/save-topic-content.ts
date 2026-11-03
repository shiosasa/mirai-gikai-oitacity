"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import {
  invalidateWebCache,
  WEB_CACHE_TAGS,
} from "@/lib/utils/cache-invalidation";
import { parseTopicEditForm } from "../../shared/utils/topic-edit";
import { saveTopicContent } from "../repositories/topic-repository";

export async function saveTopicContentAction(data: FormData) {
  await requireAdmin();
  if (process.env.TOPIC_PUBLICATION_ENABLED !== "true") {
    throw new Error("トピックス管理が無効です");
  }
  const input = parseTopicEditForm(data);
  await saveTopicContent(input);
  await invalidateWebCache([WEB_CACHE_TAGS.BILLS]);
  revalidatePath("/topics");
  revalidatePath(`/topics/${input.id}/edit`);
}
