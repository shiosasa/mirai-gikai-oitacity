"use client";

import { ChevronDown, FileText, Newspaper, Search, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type ArticleCategoryFilter,
  getCategoryLabel,
} from "@/features/bills/shared/utils/article-category";
import type {
  BillSearchResult,
  CommitteeSearchResult,
  SearchResults,
  SearchTab,
  TopicSearchResult,
} from "../../shared/types/search-types";

const TAB_LABELS: Record<SearchTab, string> = {
  all: "すべて",
  bills: "議案",
  topics: "トピックス",
  committees: "議事録",
};

const SECTION_LIMIT = 3;

function BillCard({ bill }: { bill: BillSearchResult }) {
  return (
    <Link
      href={`/bills/${bill.id}`}
      className="block border border-mirai-border rounded-lg p-4 bg-white hover:bg-mirai-surface transition-colors"
    >
      <div className="flex items-center gap-2 mb-1">
        <FileText className="size-4 text-mirai-text-muted shrink-0" />
        <span className="text-xs text-mirai-text-muted">
          議案 · {bill.session}
        </span>
      </div>
      <p className="font-medium text-mirai-text text-sm leading-snug mb-2">
        {bill.title}
      </p>
      <p className="text-xs text-mirai-text-secondary line-clamp-2 mb-3">
        {bill.summary}
      </p>
      {bill.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {bill.tags.map((tag) => (
            <Badge key={tag} variant="muted" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </Link>
  );
}

function TopicCard({ topic }: { topic: TopicSearchResult }) {
  return (
    <Link
      href={`/topics#article-${topic.id}`}
      className="block border border-mirai-border rounded-lg p-4 bg-white hover:bg-mirai-surface transition-colors"
    >
      <div className="flex items-center gap-2 mb-1">
        <Newspaper className="size-4 text-mirai-text-muted shrink-0" />
        <span className="text-xs text-mirai-text-muted">
          トピックス · {getCategoryLabel(topic.category)}
        </span>
      </div>
      <p className="font-medium text-mirai-text text-sm leading-snug mb-2">
        {topic.title}
      </p>
      {topic.summary && (
        <p className="text-xs text-mirai-text-secondary line-clamp-2">
          {topic.summary}
        </p>
      )}
    </Link>
  );
}

function CommitteeCard({ committee }: { committee: CommitteeSearchResult }) {
  return (
    <Link
      href={`/committees/${committee.committeeSlug}/${committee.sourceDocumentId}`}
      className="block border border-mirai-border rounded-lg p-4 bg-white hover:bg-mirai-surface transition-colors"
    >
      <div className="flex items-center gap-2 mb-1">
        <Users className="size-4 text-mirai-text-muted shrink-0" />
        <span className="text-xs text-mirai-text-muted">
          議事録 · {committee.committeeName}
        </span>
      </div>
      <p className="font-medium text-mirai-text text-sm leading-snug mb-2">
        {committee.title}
      </p>
      {committee.summary && (
        <p className="text-xs text-mirai-text-secondary line-clamp-2 mb-2">
          {committee.summary}
        </p>
      )}
      {committee.matchedTopics.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {committee.matchedTopics.slice(0, 3).map((topic) => (
            <Badge key={topic} variant="muted" className="text-xs">
              {topic}
            </Badge>
          ))}
        </div>
      )}
    </Link>
  );
}

function ResultSection<T>({
  title,
  items,
  renderCard,
}: {
  title: string;
  items: T[];
  renderCard: (item: T, i: number) => React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, SECTION_LIMIT);
  const remaining = items.length - SECTION_LIMIT;

  return (
    <section>
      <h2 className="text-sm font-semibold text-mirai-text-secondary mb-3">
        {title}
        <span className="ml-2 text-mirai-text-muted font-normal">
          {items.length}件
        </span>
      </h2>
      <div className="flex flex-col gap-3">
        {visible.map((item, i) => renderCard(item, i))}
      </div>
      {remaining > 0 && !expanded && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 w-full text-mirai-text-muted border border-mirai-border"
          onClick={() => setExpanded(true)}
        >
          <ChevronDown className="size-4 mr-1" />
          残り{remaining}件を表示
        </Button>
      )}
    </section>
  );
}

type Props = {
  query: string;
  category?: ArticleCategoryFilter;
  results: SearchResults | null;
};

export function SearchResultTabs({
  query,
  category = "すべて",
  results,
}: Props) {
  const [tab, setTab] = useState<SearchTab>("all");
  const searchLabel = [query, category === "すべて" ? "" : category]
    .filter(Boolean)
    .join(" / ");

  if (!results) {
    return (
      <div className="text-center py-16 text-mirai-text-muted">
        <Search className="size-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">
          キーワードを入力するか、カテゴリを選んでください
        </p>
      </div>
    );
  }

  const { bills, topics, committees } = results;
  const totalCount = bills.length + topics.length + committees.length;

  if (totalCount === 0) {
    return (
      <div className="text-center py-16 text-mirai-text-muted">
        <p className="text-sm font-medium text-mirai-text mb-1">
          「{searchLabel}」に一致する結果はありませんでした
        </p>
        <p className="text-xs">
          キーワードやカテゴリを変えて試してみてください
        </p>
      </div>
    );
  }

  const tabs: { key: SearchTab; count: number }[] = [
    { key: "all", count: totalCount },
    { key: "topics", count: topics.length },
    { key: "committees", count: committees.length },
    { key: "bills", count: bills.length },
  ];

  return (
    <div>
      <p className="text-xs text-mirai-text-muted mb-4">
        「{searchLabel}」の検索結果 全{totalCount}件
      </p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(({ key, count }) => (
          <Button
            key={key}
            variant="ghost"
            size="sm"
            onClick={() => setTab(key)}
            className={[
              "rounded-full px-4 border transition-colors",
              tab === key
                ? "bg-mirai-text text-white border-mirai-text hover:bg-mirai-text hover:text-white"
                : "bg-white text-mirai-text-secondary border-mirai-border hover:bg-mirai-surface",
            ].join(" ")}
          >
            {TAB_LABELS[key]}
            <span
              className={[
                "ml-1 text-xs",
                tab === key ? "text-white/70" : "text-mirai-text-muted",
              ].join(" ")}
            >
              {count}
            </span>
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-8">
        {(tab === "all" || tab === "topics") && topics.length > 0 && (
          <ResultSection
            title="トピックス"
            items={topics}
            renderCard={(topic, i) => <TopicCard key={i} topic={topic} />}
          />
        )}
        {(tab === "all" || tab === "committees") && committees.length > 0 && (
          <ResultSection
            title="議事録"
            items={committees}
            renderCard={(c, i) => <CommitteeCard key={i} committee={c} />}
          />
        )}
        {(tab === "all" || tab === "bills") && bills.length > 0 && (
          <ResultSection
            title="議案"
            items={bills}
            renderCard={(bill, i) => <BillCard key={i} bill={bill} />}
          />
        )}
      </div>
    </div>
  );
}
