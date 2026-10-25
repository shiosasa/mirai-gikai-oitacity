"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import {
  type InformationInput,
  informationInputSchema,
} from "../../shared/utils/information-input";
import { saveInformationRecord } from "../repositories/information-repository";

export async function saveInformation(input: InformationInput) {
  await requireAdmin();
  if (process.env.SITE_INFORMATION_ENABLED !== "true") {
    throw new Error("お知らせ機能のDB設定が完了していません");
  }
  await saveInformationRecord(informationInputSchema.parse(input));
  revalidatePath("/information");
}
