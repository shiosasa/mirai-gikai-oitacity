"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  MessageSquareText,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateJST } from "@/lib/utils/date";
import type { BillWithContent } from "../../../shared/types";
import {
  parseBillContentEntries,
  parseBillContentUpdates,
} from "../../../shared/utils/parse-bill-content-entries";
import { BillStatusBadge } from "./bill-status-badge";
import { BillTag } from "./bill-tag";

interface BillCardProps {
  bill: BillWithContent;
  onOpenAiModal?: (bill: BillWithContent) => void;
}

function SourcedEntries({
  entries,
}: {
  entries: ReturnType<typeof parseBillContentEntries>;
}) {
  if (entries.length === 0) return null;

  return (
    <ul className="space-y-2">
      {entries.map((entry, index) => (
        <li key={`${entry.text}-${index}`} className="flex items-start gap-2">
          <span aria-hidden="true" className="mt-1 text-primary">
            ・
          </span>
          <span>
            {entry.text}
            {entry.sourceUrl && (
              <a
                href={entry.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                出典 <ExternalLink aria-hidden="true" className="size-3" />
              </a>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function BillCard({ bill, onOpenAiModal }: BillCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const content = bill.bill_content;
  const article = bill.bill_article;
  const displayTitle = content?.title || bill.name;
  const summaryPoints = (
    bill.discussion_overview_points.length > 0
      ? bill.discussion_overview_points
      : (content?.summary.split("\n").filter((point) => point.trim()) ?? [])
  ).slice(0, 3);
  const supportingArguments = parseBillContentEntries(
    content?.supporting_arguments
  );
  const cautiousArguments = parseBillContentEntries(
    content?.cautious_arguments
  );
  const updates = parseBillContentUpdates(content?.updates);

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-md border-mirai-border bg-white shadow-xs transition-colors hover:border-primary/50">
      {bill.thumbnail_url && (
        <div className="relative h-48 w-full">
          <Image
            src={bill.thumbnail_url}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}

      <CardHeader className="space-y-3 p-5 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <BillStatusBadge status={bill.status} className="w-fit" />
            {bill.tags.map((tag) => (
              <BillTag key={tag.id} tag={tag} />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 text-xs text-mirai-text-muted">
            {bill.published_at && (
              <time dateTime={bill.published_at}>
                公開 {formatDateJST(bill.published_at)}
              </time>
            )}
            <time dateTime={bill.updated_at}>
              更新 {formatDateJST(bill.updated_at)}
            </time>
          </div>
        </div>

        <CardTitle className="text-xl font-bold leading-snug text-mirai-text">
          🌸{" "}
          <Link href={`/bills/${bill.id}`} className="hover:underline">
            {displayTitle}
          </Link>
        </CardTitle>

        <div className="space-y-2 rounded-md border border-oita-pink-accent/60 bg-oita-pink-light p-4">
          <h3 className="flex items-center gap-1.5 text-xs font-bold text-primary">
            <Sparkles aria-hidden="true" className="size-4" />📢
            この取り組みを3行でいうと？
          </h3>
          {summaryPoints.length > 0 ? (
            <ul className="space-y-1.5 text-sm leading-relaxed text-mirai-text">
              {summaryPoints.map((point, index) => (
                <li
                  key={`${index}-${point}`}
                  className="flex items-start gap-2"
                >
                  <span aria-hidden="true" className="text-primary">
                    •
                  </span>
                  <span>{point.replace(/^[・•\-\s]+/, "")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mirai-text-muted">
              要約情報は準備中です。
            </p>
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 border-t border-mirai-border/60 px-5 py-4 text-sm text-mirai-text">
          {content?.content && (
            <section className="space-y-1.5">
              <h3 className="flex items-center gap-1 font-bold">
                <Info aria-hidden="true" className="size-4" />
                具体的な内容
              </h3>
              <p className="whitespace-pre-wrap rounded-md bg-mirai-surface p-3 leading-relaxed">
                {content.content}
              </p>
            </section>
          )}
          {content?.reasons && (
            <section>
              <h3 className="mb-1 font-bold">必要な理由</h3>
              <p className="whitespace-pre-wrap leading-relaxed">
                {content.reasons}
              </p>
            </section>
          )}
          {content?.key_points && content.key_points.length > 0 && (
            <section>
              <h3 className="mb-1 font-bold">重要ポイント</h3>
              <ul className="list-inside list-disc space-y-1">
                {content.key_points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
          )}
          {content?.target_audience && content.target_audience.length > 0 && (
            <section>
              <h3 className="mb-1 font-bold">主に影響を受ける人</h3>
              <p>{content.target_audience.join("・")}</p>
            </section>
          )}
          {(supportingArguments.length > 0 || cautiousArguments.length > 0) && (
            <section>
              <h3 className="mb-2 font-bold">議論で出た意見</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {supportingArguments.length > 0 && (
                  <div className="space-y-2 rounded-md border border-jimu-up/20 bg-jimu-up-bg/40 p-3">
                    <h4 className="flex items-center gap-1.5 font-bold text-jimu-up">
                      <ThumbsUp aria-hidden="true" className="size-4" />
                      期待・推進の声
                    </h4>
                    <SourcedEntries entries={supportingArguments} />
                  </div>
                )}
                {cautiousArguments.length > 0 && (
                  <div className="space-y-2 rounded-md border border-jimu-down/20 bg-jimu-down-bg/40 p-3">
                    <h4 className="flex items-center gap-1.5 font-bold text-jimu-down">
                      <AlertCircle aria-hidden="true" className="size-4" />
                      慎重・懸念の声
                    </h4>
                    <SourcedEntries entries={cautiousArguments} />
                  </div>
                )}
              </div>
            </section>
          )}
          {updates.length > 0 && (
            <section>
              <h3 className="mb-2 font-bold">更新履歴</h3>
              <ol className="space-y-2 border-l border-mirai-border pl-4">
                {updates.map((update, index) => (
                  <li key={`${update.date}-${index}`}>
                    <time className="mr-2 text-xs font-semibold text-mirai-text-muted">
                      追記: {update.date}
                    </time>
                    <span>{update.text}</span>
                    {update.sourceUrl && (
                      <a
                        href={update.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 text-primary hover:underline"
                      >
                        出典
                      </a>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}
          {article && (article.positive_voice || article.cautious_voice) && (
            <section>
              <h3 className="mb-2 font-bold">
                💬 市民の声（大分弁のリアルな声）
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {article.positive_voice && (
                  <div className="space-y-2 rounded-md border border-green-500/20 bg-green-50/40 p-3">
                    <h4 className="flex items-center gap-1.5 font-bold text-green-700">
                      <ThumbsUp aria-hidden="true" className="size-4" />
                      賛成・期待の声
                    </h4>
                    <p className="text-sm leading-relaxed italic text-gray-700">
                      「{article.positive_voice}」
                    </p>
                  </div>
                )}
                {article.cautious_voice && (
                  <div className="space-y-2 rounded-md border border-orange-500/20 bg-orange-50/40 p-3">
                    <h4 className="flex items-center gap-1.5 font-bold text-orange-700">
                      <AlertCircle aria-hidden="true" className="size-4" />
                      慎重・懸念の声
                    </h4>
                    <p className="text-sm leading-relaxed italic text-gray-700">
                      「{article.cautious_voice}」
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}
          {bill.source_url && (
            <a
              href={bill.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
            >
              根拠資料・議事録を開く
              <ExternalLink aria-hidden="true" className="size-4" />
            </a>
          )}
        </CardContent>
      )}

      <CardFooter className="mt-auto flex flex-col items-stretch gap-2 border-t border-mirai-border/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className="gap-1 text-xs font-semibold text-mirai-text-secondary hover:text-primary"
        >
          {isExpanded ? "閉じる" : "詳細・重要ポイントを読む"}
          {isExpanded ? (
            <ChevronUp aria-hidden="true" className="size-4" />
          ) : (
            <ChevronDown aria-hidden="true" className="size-4" />
          )}
        </Button>
        {onOpenAiModal ? (
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenAiModal(bill)}
            className="gap-1.5 bg-oita-pink text-xs font-bold text-white hover:bg-oita-pink/90"
          >
            <MessageSquareText aria-hidden="true" className="size-4" />
            これ、どう思う？話してみらん？
          </Button>
        ) : (
          <Button
            asChild
            size="sm"
            className="gap-1.5 bg-oita-pink text-xs font-bold text-white hover:bg-oita-pink/90"
          >
            <Link href={`/bills/${bill.id}`}>
              <MessageSquareText aria-hidden="true" className="size-4" />
              これ、どう思う？話してみらん？
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
