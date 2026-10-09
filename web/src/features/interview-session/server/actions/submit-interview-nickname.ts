"use server";

import { normalizeInterviewNickname } from "../../shared/utils/normalize-interview-nickname";
import { updateInterviewSessionNickname } from "../repositories/interview-session-repository";
import { verifySessionOwnership } from "../utils/verify-session-ownership";

interface SubmitInterviewNicknameResult {
  success: boolean;
  error?: string;
}

/**
 * インタビューセッションのニックネームを保存する
 * 未入力（匿名）の場合は null を保存する
 */
export async function submitInterviewNickname(
  sessionId: string,
  nickname: string
): Promise<SubmitInterviewNicknameResult> {
  const ownershipResult = await verifySessionOwnership(sessionId);
  if (!ownershipResult.authorized) {
    return { success: false, error: ownershipResult.error };
  }

  try {
    await updateInterviewSessionNickname(
      sessionId,
      normalizeInterviewNickname(nickname)
    );
  } catch (error) {
    console.error("Failed to save interview nickname:", error);
    return { success: false, error: "ニックネームの保存に失敗しました" };
  }

  return { success: true };
}
