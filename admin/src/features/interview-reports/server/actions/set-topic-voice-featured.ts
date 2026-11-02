"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import {
  invalidateWebCache,
  WEB_CACHE_TAGS,
} from "@/lib/utils/cache-invalidation";
import {
  getTopicVoiceFeatureBlocker,
  normalizeTopicVoiceRow,
} from "../../shared/utils/topic-voice";
import {
  countFeaturedTopicVoicesByBillId,
  findTopicInterviewReportById,
  updateTopicVoiceFeatured,
} from "../repositories/interview-report-repository";

export async function setTopicVoiceFeaturedAction(
  reportId: string,
  featured: boolean
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  const parsedId = z.string().uuid().safeParse(reportId);
  if (!parsedId.success) {
    return { success: false, error: "レポートIDが不正です" };
  }

  try {
    if (featured) {
      const report = normalizeTopicVoiceRow(
        await findTopicInterviewReportById(parsedId.data)
      );
      if (!report) {
        return {
          success: false,
          error: "トピックスのインタビュー回答ではありません",
        };
      }
      const blocker = getTopicVoiceFeatureBlocker(
        report,
        await countFeaturedTopicVoicesByBillId(report.billId)
      );
      if (blocker) return { success: false, error: blocker };
    }

    await updateTopicVoiceFeatured(parsedId.data, featured);
    await invalidateWebCache([WEB_CACHE_TAGS.BILLS]);
    revalidatePath("/topic-voices");
    return { success: true };
  } catch (error) {
    console.error("Error updating topic voice:", error);
    return { success: false, error: "生の声の更新に失敗しました" };
  }
}
