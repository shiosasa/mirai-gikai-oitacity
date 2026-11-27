"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import {
  type GeneralQuestionInput,
  parseGeneralQuestionInput,
} from "../../shared/utils/general-question-input";
import {
  createGeneralQuestionRecord,
  deleteGeneralQuestionRecord,
  setGeneralQuestionPublishStatus,
  updateGeneralQuestionRecord,
} from "../repositories/general-question-repository";

export async function createGeneralQuestionAction(
  input: GeneralQuestionInput
): Promise<{ id: string }> {
  await requireAdmin();
  const parsed = parseGeneralQuestionInput(input);
  const id = await createGeneralQuestionRecord(parsed);
  revalidatePath("/general-questions");
  return { id };
}

export async function updateGeneralQuestionAction(
  id: string,
  input: GeneralQuestionInput
): Promise<void> {
  await requireAdmin();
  const parsed = parseGeneralQuestionInput(input);
  await updateGeneralQuestionRecord(id, parsed);
  revalidatePath("/general-questions");
  revalidatePath(`/general-questions/${id}`);
}

export async function toggleGeneralQuestionPublishAction(
  id: string,
  publishStatus: "draft" | "published"
): Promise<void> {
  await requireAdmin();
  await setGeneralQuestionPublishStatus(id, publishStatus);
  revalidatePath("/general-questions");
  revalidatePath(`/general-questions/${id}`);
}

export async function deleteGeneralQuestionAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteGeneralQuestionRecord(id);
  revalidatePath("/general-questions");
}
