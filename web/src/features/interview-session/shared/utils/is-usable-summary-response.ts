import { isValidReport } from "../message-utils";
import { interviewChatResponseSchema } from "../schemas";

export function isUsableSummaryResponse(content: string): boolean {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return false;
  }

  const result = interviewChatResponseSchema.safeParse(parsed);
  if (!result.success) return false;
  if (result.data.next_stage === "chat") return true;

  const report = result.data.report;
  return (
    report != null &&
    isValidReport({
      ...report,
      opinions: report.opinions.filter(
        (opinion) => opinion.title || opinion.content
      ),
    })
  );
}
