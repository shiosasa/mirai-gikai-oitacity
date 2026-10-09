"use server";

import type { InterviewSession } from "../../shared/types";
import { normalizeInterviewNickname } from "../../shared/utils/normalize-interview-nickname";
import { createInterviewSessionCore } from "../services/create-interview-session-core";

export async function createInterviewSession({
  interviewConfigId,
  nickname,
}: {
  interviewConfigId: string;
  nickname?: string;
}): Promise<InterviewSession> {
  return createInterviewSessionCore({
    interviewConfigId,
    nickname: normalizeInterviewNickname(nickname ?? ""),
  });
}
