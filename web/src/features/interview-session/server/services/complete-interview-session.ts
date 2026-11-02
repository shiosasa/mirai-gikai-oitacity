import "server-only";

import type { InterviewReport } from "../../shared/types";
import { extractCurrentReport } from "../../shared/utils/report-extraction";
import {
  findInterviewMessagesBySessionIdDesc,
  updateInterviewSessionCompleted,
  upsertInterviewReport,
} from "../repositories/interview-session-repository";

type CompleteInterviewSessionParams = {
  sessionId: string;
};

/**
 * インタビューを完了し、会話中に生成されたレポートを保存する
 */
export async function completeInterviewSession({
  sessionId,
}: CompleteInterviewSessionParams): Promise<InterviewReport> {
  // メッセージ履歴を取得（新しい順）
  const messages = await findInterviewMessagesBySessionIdDesc(sessionId);

  const reportData = extractCurrentReport(messages);
  if (!reportData) {
    throw new Error(
      "最新のレポートを確認できませんでした。しばらく待ってからもう一度お試しください。"
    );
  }

  // opinions にソースメッセージの内容を付与
  const enrichedOpinions = reportData.opinions.map((opinion) => {
    if (!opinion.source_message_id) {
      return { ...opinion, source_message_content: null };
    }
    const sourceMsg = messages.find((m) => m.id === opinion.source_message_id);
    return {
      ...opinion,
      source_message_content: sourceMsg?.content ?? null,
    };
  });

  // レポートを保存（UPSERT）
  // scoresはZodスキーマでバリデーション済み（totalは0-100の整数）
  const report = await upsertInterviewReport({
    interview_session_id: sessionId,
    summary: reportData.summary,
    stance: reportData.stance,
    role: reportData.role,
    role_description: reportData.role_description,
    role_title: reportData.role_title,
    municipality_connection: reportData.municipality_connection,
    opinions: enrichedOpinions,
    scores: reportData.scores,
  });

  // セッションを完了
  await updateInterviewSessionCompleted(sessionId);

  return report;
}
