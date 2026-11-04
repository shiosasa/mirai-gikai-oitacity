"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import {
  conferenceInput,
  conferenceItemInput,
  conferenceTurnInput,
  recordId,
} from "@/features/content-management/shared/utils/content-input";
import {
  deleteConferenceItemRecord,
  deleteConferenceTurnRecord,
  saveConferenceItemRecord,
  saveConferenceRecord,
  saveConferenceTurnRecord,
} from "../repositories/conference-repository";

export async function saveConference(id: string | null, input: unknown) {
  await requireAdmin();
  const result = await saveConferenceRecord(
    id === null ? null : recordId.parse(id),
    conferenceInput.parse(input)
  );
  revalidatePath("/press-conferences", "layout");
  return result;
}

export async function saveConferenceItem(
  conferenceId: string,
  id: string | null,
  input: unknown
) {
  await requireAdmin();
  await saveConferenceItemRecord(
    recordId.parse(conferenceId),
    id === null ? null : recordId.parse(id),
    conferenceItemInput.parse(input)
  );
  revalidatePath("/press-conferences", "layout");
}

export async function deleteConferenceItem(conferenceId: string, id: string) {
  await requireAdmin();
  await deleteConferenceItemRecord(
    recordId.parse(conferenceId),
    recordId.parse(id)
  );
  revalidatePath("/press-conferences", "layout");
}

export async function saveConferenceTurn(
  conferenceId: string,
  itemId: string,
  id: string | null,
  input: unknown
) {
  await requireAdmin();
  await saveConferenceTurnRecord(
    recordId.parse(conferenceId),
    recordId.parse(itemId),
    id === null ? null : recordId.parse(id),
    conferenceTurnInput.parse(input)
  );
  revalidatePath("/press-conferences", "layout");
}

export async function deleteConferenceTurn(
  conferenceId: string,
  itemId: string,
  id: string
) {
  await requireAdmin();
  await deleteConferenceTurnRecord(
    recordId.parse(conferenceId),
    recordId.parse(itemId),
    recordId.parse(id)
  );
  revalidatePath("/press-conferences", "layout");
}
