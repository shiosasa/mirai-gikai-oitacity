"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import {
  meetingInput,
  numericId,
  proposalInput,
  sessionInput,
} from "@/features/content-management/shared/utils/content-input";
import {
  saveMeetingRecord,
  saveProposalRecord,
  saveSessionRecord,
} from "../repositories/minutes-repository";

export async function saveMeeting(id: number | null, input: unknown) {
  await requireAdmin();
  const parsedId = id === null ? null : numericId.parse(id);
  const result = await saveMeetingRecord(parsedId, meetingInput.parse(input));
  revalidatePath("/minutes", "layout");
  revalidatePath("/mayor-proposals", "layout");
  return result;
}

export async function saveSession(
  meetingId: number,
  id: number | null,
  input: unknown
) {
  await requireAdmin();
  const result = await saveSessionRecord(
    numericId.parse(meetingId),
    id === null ? null : numericId.parse(id),
    sessionInput.parse(input)
  );
  revalidatePath("/minutes", "layout");
  return result;
}

export async function saveProposal(id: number, input: unknown) {
  await requireAdmin();
  await saveProposalRecord(numericId.parse(id), proposalInput.parse(input));
  revalidatePath("/mayor-proposals", "layout");
}
