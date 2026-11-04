"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import {
  archiveInput,
  archiveTopicInput,
  recordId,
} from "@/features/content-management/shared/utils/content-input";
import {
  saveArchiveRecord,
  saveArchiveTopicRecord,
} from "../repositories/archive-repository";

export async function saveArchive(id: string, input: unknown) {
  await requireAdmin();
  await saveArchiveRecord(recordId.parse(id), archiveInput.parse(input));
  revalidatePath("/committee-meetings", "layout");
}

export async function saveArchiveTopic(
  meetingId: string,
  id: string,
  input: unknown
) {
  await requireAdmin();
  await saveArchiveTopicRecord(
    recordId.parse(meetingId),
    recordId.parse(id),
    archiveTopicInput.parse(input)
  );
  revalidatePath("/committee-meetings", "layout");
}
