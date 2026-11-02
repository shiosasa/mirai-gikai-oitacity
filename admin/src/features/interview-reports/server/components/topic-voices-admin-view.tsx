import "server-only";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { TopicVoiceFeatureButton } from "../../client/components/topic-voice-feature-button";
import { formatRoleLabel } from "../../shared/constants";
import {
  getTopicVoiceFeatureBlocker,
  groupTopicVoicesByTopic,
  normalizeTopicVoiceRow,
  TOPIC_VOICE_MAX_PER_TOPIC,
  type TopicVoiceRow,
} from "../../shared/utils/topic-voice";
import { findTopicInterviewReports } from "../repositories/interview-report-repository";
import { StanceBadge } from "./stance-badge";

export async function TopicVoicesAdminView() {
  await requireAdmin();
  const rows = (await findTopicInterviewReports())
    .map(normalizeTopicVoiceRow)
    .filter((row): row is TopicVoiceRow => row !== null);
  const groups = groupTopicVoicesByTopic(rows);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">AIインタビューの声</h1>
        <p className="text-sm text-gray-600">
          トピックス記事のAIインタビューの最後に作られた「意見の要約」の一覧です。「この要約を生の声に採用」すると、記事の「話してみらん？」ボタンの直前にある「みんなの生の声」に、立場・賛否と要約が表示され、レポート全文へのリンクが付きます。
          本人が公開に同意した回答のみ採用でき、1記事あたり最大
          {TOPIC_VOICE_MAX_PER_TOPIC}件です。
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="text-gray-500">まだ回答はありません。</p>
      ) : (
        groups.map((group) => (
          <div key={group.billId} className="rounded-lg border p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">{group.topicTitle}</h2>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>
                  採用 {group.featuredCount}/{TOPIC_VOICE_MAX_PER_TOPIC}
                </span>
                <Link
                  href={`/bills/${group.billId}/reports`}
                  className="text-blue-600 hover:underline"
                >
                  回答一覧（チャット含む）
                </Link>
              </div>
            </div>
            <ul className="space-y-3">
              {group.reports.map((report) => (
                <li
                  key={report.reportId}
                  className="rounded-md bg-gray-50 p-3 space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <StanceBadge stance={report.stance} />
                    <span className="text-gray-700">
                      {formatRoleLabel(report.role, report.roleTitle) ??
                        "立場未設定"}
                    </span>
                    {report.featuredAt ? (
                      <Badge className="bg-green-600">掲載中</Badge>
                    ) : null}
                    <Badge variant="outline">
                      {report.isPublicByUser ? "本人同意あり" : "本人同意なし"}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(report.createdAt).toLocaleString("ja-JP", {
                        timeZone: "Asia/Tokyo",
                      })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">
                    {report.summary || "（要約なし）"}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <TopicVoiceFeatureButton
                      reportId={report.reportId}
                      featured={Boolean(report.featuredAt)}
                      blocker={getTopicVoiceFeatureBlocker(
                        report,
                        group.featuredCount
                      )}
                    />
                    <Link
                      href={`/bills/${report.billId}/reports/${report.sessionId}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      詳細・チャット履歴
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
