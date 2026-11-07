"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import {
  invalidateWebCache,
  WEB_CACHE_TAGS,
} from "@/lib/utils/cache-invalidation";
import {
  parseTopicEditForm,
  topicContentSchema,
  topicFormData,
} from "../../shared/utils/topic-edit";
import {
  createTopicContent,
  saveTopicContent,
} from "../repositories/topic-repository";
import { prepareTopicSources } from "../repositories/topic-source-repository";

export async function saveTopicContentAction(data: FormData) {
  await requireAdmin();
  if (process.env.TOPIC_PUBLICATION_ENABLED !== "true") {
    throw new Error("トピックス管理が無効です");
  }
  const input = parseTopicEditForm(data);
  input.source_refs = await prepareTopicSources(input.source_refs);
  await saveTopicContent(input);
  await invalidateWebCache([WEB_CACHE_TAGS.BILLS]);
  revalidatePath("/topics");
  revalidatePath(`/topics/${input.id}/edit`);
}

export async function createTopicContentAction(data: FormData) {
  await requireAdmin();
  if (process.env.TOPIC_PUBLICATION_ENABLED !== "true") {
    throw new Error("トピックス管理が無効です");
  }
  const input = topicContentSchema.parse(topicFormData(data));
  input.source_refs = await prepareTopicSources(input.source_refs);
  const id = await createTopicContent(input);
  revalidatePath("/topics");
  return id;
}
