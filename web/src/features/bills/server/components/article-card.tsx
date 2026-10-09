import type { BillArticle } from "../../shared/types";
import { getCategoryLabel } from "../../shared/utils/article-category";

interface ArticleCardProps {
  article: BillArticle;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <div className="w-full rounded-lg border border-mirai-border bg-white p-4 sm:p-6 hover:shadow-md transition-shadow">
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          {/* ステータスバッジ */}
          <div className="mb-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white ${article.status_class || "bg-gray-500"}`}
            >
              {article.status_label}
            </span>
          </div>

          {/* タイトル */}
          <h3 className="text-lg font-bold text-mirai-text leading-tight">
            {article.title}
          </h3>
        </div>
      </div>

      {/* カテゴリ表示 */}
      <div className="mb-4">
        <span className="inline-flex items-center rounded-full bg-oita-pink-light px-3 py-1 text-xs font-medium text-oita-pink">
          {getCategoryLabel(article.category)}
        </span>
      </div>

      {/* 要約 */}
      <div className="mb-4 space-y-1">
        <p className="text-sm text-mirai-text">{article.summary_line_1}</p>
        {article.summary_line_2 && (
          <p className="text-sm text-mirai-text">{article.summary_line_2}</p>
        )}
        {article.summary_line_3 && (
          <p className="text-sm text-mirai-text">{article.summary_line_3}</p>
        )}
      </div>

      {/* 詳細情報 */}
      {article.details && (
        <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-1">経緯</p>
          <p className="text-sm text-gray-600 line-clamp-3">
            {article.details}
          </p>
        </div>
      )}

      {/* ポイント */}
      {(article.point_1 || article.point_2 || article.point_3) && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-semibold text-mirai-text">ポイント</p>
          <ul className="space-y-1">
            {article.point_1 && (
              <li className="flex gap-2 text-sm text-mirai-text">
                <span className="text-oita-pink font-bold">1.</span>
                <span>{article.point_1}</span>
              </li>
            )}
            {article.point_2 && (
              <li className="flex gap-2 text-sm text-mirai-text">
                <span className="text-oita-pink font-bold">2.</span>
                <span>{article.point_2}</span>
              </li>
            )}
            {article.point_3 && (
              <li className="flex gap-2 text-sm text-mirai-text">
                <span className="text-oita-pink font-bold">3.</span>
                <span>{article.point_3}</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* 市民の声 */}
      {(article.positive_voice || article.cautious_voice) && (
        <div className="mb-4 space-y-3 bg-oita-pink-light rounded p-3">
          {article.positive_voice && (
            <div>
              <p className="text-xs font-semibold text-oita-pink mb-1">
                ✨ 賛成の声
              </p>
              <p className="text-sm text-gray-700">
                「{article.positive_voice}」
              </p>
            </div>
          )}
          {article.cautious_voice && (
            <div>
              <p className="text-xs font-semibold text-oita-pink mb-1">
                ⚠️ 慎重の声
              </p>
              <p className="text-sm text-gray-700">
                「{article.cautious_voice}」
              </p>
            </div>
          )}
        </div>
      )}

      {/* リンク */}
      {article.link_url && (
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <a
            href={article.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-oita-pink hover:underline"
          >
            {article.link_label || "詳しく見る"}
            <span>→</span>
          </a>
        </div>
      )}
    </div>
  );
}
