"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BillArticle, TopicSourceRef } from "../../../shared/types";
import { getCategoryLabel } from "../../../shared/utils/article-category";
import { buildSessionPath } from "../../../shared/utils/build-session-path";
import { getStatusBadgeClass } from "../../../shared/utils/get-status-badge-class";

interface ArticleAccordionCardProps {
  article: BillArticle;
}

export function ArticleAccordionCard({ article }: ArticleAccordionCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full rounded-lg border border-mirai-border bg-white overflow-hidden">
      {/* ヘッダー（常に表示） */}
      <div className="p-4 sm:p-6 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* カテゴリバッジ */}
          <div className="mb-2">
            <span className="inline-flex items-center rounded-full bg-oita-pink-light px-3 py-1 text-xs font-medium text-oita-pink">
              {getCategoryLabel(article.category)}
            </span>
            <span className="text-xs text-mirai-text-secondary ml-2">
              議決日: {formatDate(article.decision_date)}
            </span>
            {article.published_at && (
              <span className="text-xs text-mirai-text-secondary ml-2">
                | 公開日: {formatDate(article.published_at)}
              </span>
            )}
          </div>

          {/* ステータス + タイトル */}
          <div className="flex items-start gap-2 mb-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white flex-shrink-0 ${getStatusBadgeClass(article.status_class || article.status_label)}`}
            >
              {article.status_label}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-mirai-text leading-snug break-words">
              {article.title}
            </h3>
          </div>
        </div>

        {/* 展開ボタン */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="flex-shrink-0 flex flex-col items-center gap-1 h-auto p-1.5 hover:bg-transparent hover:opacity-70"
        >
          {isOpen ? (
            <ChevronUp className="size-5 text-oita-pink" />
          ) : (
            <ChevronDown className="size-5 text-oita-pink" />
          )}
          <span className="text-xs font-semibold text-oita-pink text-center break-words max-w-[80px]">
            詳細・重要
            <br />
            ポイント
          </span>
        </Button>
      </div>

      {/* 要約（フルサイズ） */}
      {(article.summary_line_1 ||
        article.summary_line_2 ||
        article.summary_line_3) && (
        <div className="px-4 sm:px-6 pb-4 border-t border-gray-200">
          <p className="text-xs font-bold text-gray-700 mb-2">
            📢 この取り組みを3行でいうと？
          </p>
          <div className="bg-gradient-to-r from-oita-pink-light to-blue-50 border-l-4 border-oita-pink rounded p-3 space-y-1">
            {article.summary_line_1 && (
              <p className="text-sm text-mirai-text">
                <span className="font-semibold text-oita-pink">1.</span>{" "}
                {article.summary_line_1}
              </p>
            )}
            {article.summary_line_2 && (
              <p className="text-sm text-mirai-text">
                <span className="font-semibold text-oita-pink">2.</span>{" "}
                {article.summary_line_2}
              </p>
            )}
            {article.summary_line_3 && (
              <p className="text-sm text-mirai-text">
                <span className="font-semibold text-oita-pink">3.</span>{" "}
                {article.summary_line_3}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 展開時のコンテンツ */}
      {isOpen && (
        <div className="border-t border-gray-200 p-4 sm:p-6 space-y-4">
          {/* 取り組みの具体的な詳細内容 */}
          {article.details && (
            <div className="border-l-4 border-purple-300 bg-purple-50 rounded p-3">
              <p className="text-xs font-bold text-purple-700 mb-2">
                □ 取り組みの具体的な詳細内容
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {article.details}
              </p>
            </div>
          )}

          {/* この取り組みが必要な理由 */}
          {article.reason && (
            <div className="border-l-4 border-blue-300 bg-blue-50 rounded p-3">
              <p className="text-xs font-bold text-blue-700 mb-2">
                ■ この取り組みが必要な理由
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {article.reason}
              </p>
            </div>
          )}

          {/* この取り組みの重要ポイント */}
          {(article.point_1 || article.point_2 || article.point_3) && (
            <div className="border-l-4 border-yellow-400 bg-yellow-50 rounded p-3">
              <p className="text-xs font-bold text-yellow-700 mb-2">
                ★ この取り組みの重要ポイント
              </p>
              <div className="space-y-3 text-sm text-gray-700">
                {article.point_1 && (
                  <p className="whitespace-pre-wrap">{article.point_1}</p>
                )}
                {article.point_2 && (
                  <p className="whitespace-pre-wrap">{article.point_2}</p>
                )}
                {article.point_3 && (
                  <p className="whitespace-pre-wrap">{article.point_3}</p>
                )}
              </div>
            </div>
          )}

          {/* 主に影響を受ける人・対象者 */}
          {article.target_audience && (
            <div className="border-l-4 border-red-300 bg-red-50 rounded p-3">
              <p className="text-xs font-bold text-red-700 mb-2">
                ● 主に影響を受ける人・対象者
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {article.target_audience}
              </p>
            </div>
          )}

          {/* 議論の争点：推進派・慎重派 */}
          {(article.positive_voice || article.cautious_voice) && (
            <div className="bg-oita-pink text-white rounded-lg p-4 space-y-3">
              <p className="text-xs font-bold">
                💬 議論の争点（意見が分かれるところ）
              </p>

              <div className="space-y-3">
                {article.positive_voice && (
                  <div className="border-l-4 border-white border-opacity-50 pl-3 py-2">
                    <p className="text-xs font-semibold mb-2">
                      ✨ 推進派（賛成・期待の声）
                    </p>
                    <p className="text-sm whitespace-pre-wrap">
                      {article.positive_voice}
                    </p>
                  </div>
                )}
                {article.cautious_voice && (
                  <div className="border-l-4 border-white border-opacity-50 pl-3 py-2">
                    <p className="text-xs font-semibold mb-2">
                      ⚠️ 慎重派（懸念・慎重論の声）
                    </p>
                    <p className="text-sm whitespace-pre-wrap">
                      {article.cautious_voice}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 正確な根拠と関連リンク */}
          {article.link_url && (
            <div className="border-l-4 border-green-400 bg-green-50 rounded p-3">
              <p className="text-xs font-bold text-green-700 mb-2">
                🔗 正確な根拠と関連リンク
              </p>
              <a
                href={article.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:underline"
              >
                {article.link_label || "詳しく見る"}
                <span>→</span>
              </a>
            </div>
          )}

          {/* 裏付けとなった会議・議案 */}
          {article.source_refs && article.source_refs.length > 0 && (
            <div className="border-l-4 border-indigo-300 bg-indigo-50 rounded p-3">
              <p className="text-xs font-bold text-indigo-700 mb-2">
                🏛 裏付けとなった会議・議案（議事録より）
              </p>
              <ul className="space-y-3">
                {article.source_refs.map((ref: TopicSourceRef) => (
                  <li
                    key={`${ref.session_id}-${ref.bill_number ?? ""}`}
                    className="text-sm"
                  >
                    <Link
                      href={buildSessionPath(ref)}
                      className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline"
                    >
                      {ref.session_label}
                      {ref.bill_number ? ` ${ref.bill_number}` : ""}
                      <span>→</span>
                    </Link>
                    {ref.bill_name && (
                      <p className="text-xs text-gray-700 mt-0.5">
                        {ref.bill_name}
                      </p>
                    )}
                    {ref.detail_bill_id && (
                      <Link
                        href={`/bills/${ref.detail_bill_id}`}
                        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-oita-pink hover:underline"
                      >
                        {ref.bill_number ?? "議案"}の詳細ページを見る
                        <span>→</span>
                      </Link>
                    )}
                    {ref.evidence_quote && (
                      <blockquote className="mt-1 border-l-2 border-indigo-200 pl-2 text-xs text-gray-600">
                        「{ref.evidence_quote}」
                      </blockquote>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 閉じるボタン */}
          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-oita-pink hover:bg-transparent hover:underline p-0 h-auto gap-1"
            >
              <ChevronUp className="size-4" /> 閉じる
            </Button>
          </div>
        </div>
      )}

      {/* AI インタビューボタン（公開中のインタビューがある場合のみ表示） */}
      {article.interview_bill_id && (
        <div className="px-4 sm:px-6 py-4">
          <Link
            href={`/bills/${article.interview_bill_id}/interview`}
            className="block w-full bg-oita-pink text-white rounded-lg py-2 text-sm font-semibold hover:opacity-90 transition text-center"
          >
            💬 これどう思う？話してみらん？
          </Link>
        </div>
      )}
    </div>
  );
}

function formatDate(date?: string | Date | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}
