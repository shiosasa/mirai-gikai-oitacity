"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import {
  invalidateWebCache,
  WEB_CACHE_TAGS,
} from "@/lib/utils/cache-invalidation";
import { parseTopicPublicationStatus } from "../../shared/utils/topic-publication";
import { updateTopicPublication } from "../repositories/topic-repository";

export async function setTopicPublication(id: string, value: string) {
  await requireAdmin();
  if (process.env.TOPIC_PUBLICATION_ENABLED !== "true") {
    throw new Error("トピックス公開機能のDB設定が完了していません");
  }
  const validatedId = z.string().uuid().parse(id);
  const status = parseTopicPublicationStatus(value);
  await updateTopicPublication(validatedId, status);
  await invalidateWebCache([WEB_CACHE_TAGS.BILLS]);
  revalidatePath("/topics");
}
