"use server";

import { getPoliticianSpeechMode } from "@mirai-gikai/shared/politicians/speech-mode";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import {
  type SpeechInput,
  speechInputSchema,
} from "../../shared/utils/speech-input";
import { validateSpeechPublication } from "../../shared/utils/speech-publication-validation";
import {
  findSpeechPoliticians,
  findSpeechSessionContent,
  saveSpeechHighlightRecord,
  unpublishSpeechHighlightRecord,
} from "../repositories/speech-highlight-repository";

function requireSpeechDatabase() {
  if (getPoliticianSpeechMode(process.env) !== "database") {
    throw new Error("議員の発言管理はDB設定が完了していません");
  }
}

export async function saveSpeechHighlight(input: SpeechInput) {
  try {
    await requireAdmin();
    requireSpeechDatabase();
    const result = speechInputSchema.safeParse(input);
    if (!result.success) {
      return {
        error: result.error.issues[0]?.message ?? "入力内容を確認してください",
      };
    }

    const values = result.data;
    const politicians = await findSpeechPoliticians();
    if (
      !politicians.some((politician) => politician.id === values.politicianId)
    ) {
      return { error: "選択した議員が見つかりません" };
    }
    if (values.isPublished) {
      const session = await findSpeechSessionContent(values.sessionId);
      const error = validateSpeechPublication(values, session, politicians);
      if (error) return { error };
    }

    await saveSpeechHighlightRecord(values);
    revalidatePath("/politician-speeches");
    return { error: null };
  } catch (error) {
    console.error("Save speech highlight failed:", error);
    return {
      error:
        error instanceof Error ? error.message : "発言を保存できませんでした",
    };
  }
}

export async function unpublishSpeechHighlight(id: string) {
  try {
    await requireAdmin();
    requireSpeechDatabase();
    const parsed = z.string().uuid("発言のIDが不正です").safeParse(id);
    if (!parsed.success) return { error: "発言のIDが不正です" };
    await unpublishSpeechHighlightRecord(parsed.data);
    revalidatePath("/politician-speeches");
    return { error: null };
  } catch (error) {
    console.error("Unpublish speech highlight failed:", error);
    return {
      error:
        error instanceof Error ? error.message : "非公開にできませんでした",
    };
  }
}
