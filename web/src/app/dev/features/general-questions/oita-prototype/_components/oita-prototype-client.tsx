"use client";

import { ArrowLeft, ArrowRight, MessageCircle, User } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  collectOitaQuestionTags,
  filterOitaQuestionsByTag,
  type OitaExchangeTurn,
  type OitaGeneralQuestion,
} from "../_lib/oita-prototype-helpers";

function ExchangeBubble({
  turn,
  mode,
}: {
  turn: OitaExchangeTurn;
  mode: "summary" | "raw";
}) {
  const isQuestioner = turn.speakerRole === "questioner";
  const text = mode === "summary" ? turn.summary : turn.rawText;

  if (isQuestioner) {
    return (
      <div className="flex items-end justify-end gap-2">
        <div className="max-w-[82%]">
          <p className="mb-1 text-right text-xs text-mirai-text-secondary">
            {turn.speakerLabel}（{turn.turnType}）
          </p>
          <div className="rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-primary-foreground">
            <p className="text-sm leading-relaxed">{text}</p>
          </div>
        </div>
        <Avatar className="size-9 shrink-0">
          <AvatarImage src={turn.avatarUrl ?? undefined} alt="" />
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User aria-hidden="true" className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <Avatar className="size-9 shrink-0 border border-border">
        <AvatarImage src={turn.avatarUrl ?? undefined} alt="" />
        <AvatarFallback className="bg-mirai-surface-muted text-mirai-text-secondary">
          <MessageCircle aria-hidden="true" className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[82%]">
        <p className="mb-1 text-xs text-mirai-text-secondary">
          {turn.speakerLabel}（{turn.turnType}）
        </p>
        <div className="rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3">
          <p className="text-sm leading-relaxed text-mirai-text">{text}</p>
        </div>
      </div>
    </div>
  );
}

export function OitaPrototypeClient({
  questions,
}: {
  questions: OitaGeneralQuestion[];
}) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"summary" | "raw">("summary");

  const tags = collectOitaQuestionTags(questions);
  const filteredQuestions = filterOitaQuestionsByTag(questions, selectedTag);
  const activeQuestion = selectedId
    ? (questions.find((q) => q.id === selectedId) ?? null)
    : null;

  if (activeQuestion) {
    return (
      <section aria-label="一問一答詳細" className="space-y-6">
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSelectedId(null)}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            質問者一覧に戻る
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
            <div className="flex items-center gap-3">
              <Avatar className="size-12 shrink-0">
                <AvatarImage
                  src={activeQuestion.avatarUrl ?? undefined}
                  alt=""
                />
                <AvatarFallback className="bg-oita-pink-light text-base text-oita-pink">
                  {activeQuestion.questionerName.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-medium text-oita-pink">
                  {activeQuestion.sessionLabel}・
                  {activeQuestion.sessionDayLabel}（
                  {activeQuestion.questionOrder}番目）
                </p>
                <h2 className="mt-1 text-xl font-bold text-mirai-text">
                  {activeQuestion.questionerName}（{activeQuestion.faction}）
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={viewMode === "summary" ? "default" : "outline"}
                onClick={() => setViewMode("summary")}
              >
                AI要約
              </Button>
              <Button
                type="button"
                size="sm"
                variant={viewMode === "raw" ? "default" : "outline"}
                onClick={() => setViewMode("raw")}
              >
                会議録イメージ
              </Button>
            </div>
          </div>

          <div className="mt-6 space-y-8">
            {activeQuestion.topics.map((topic) => (
              <div key={topic.id} className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{topic.tag}</Badge>
                  <h3 className="text-base font-bold text-mirai-text">
                    {topic.title}
                  </h3>
                </div>
                <div className="space-y-4 rounded-lg bg-mirai-surface p-4 sm:p-5">
                  {topic.exchanges.map((turn) => (
                    <ExchangeBubble key={turn.id} turn={turn} mode={viewMode} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={selectedTag === null ? "default" : "outline"}
          onClick={() => setSelectedTag(null)}
        >
          すべて ({questions.length})
        </Button>
        {tags.map(({ tag, count }) => (
          <Button
            key={tag}
            type="button"
            size="sm"
            variant={selectedTag === tag ? "default" : "outline"}
            onClick={() =>
              setSelectedTag((current) => (current === tag ? null : tag))
            }
          >
            {tag} ({count})
          </Button>
        ))}
      </div>

      <section
        aria-label="質問者一覧"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {filteredQuestions.map((question) => (
          <Button
            key={question.id}
            type="button"
            variant="outline"
            onClick={() => setSelectedId(question.id)}
            className="h-auto w-full flex-col items-stretch justify-between gap-4 rounded-xl border-border bg-card p-5 text-left whitespace-normal shadow-none transition-colors hover:border-primary hover:bg-oita-pink-light/30"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-12 shrink-0">
                  <AvatarImage src={question.avatarUrl ?? undefined} alt="" />
                  <AvatarFallback className="bg-oita-pink-light text-sm text-oita-pink">
                    {question.questionerName.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-bold text-mirai-text">
                    {question.questionerName}
                  </p>
                  <p className="text-xs text-mirai-text-secondary">
                    {question.faction}・{question.sessionDayLabel}（
                    {question.questionOrder}番目）
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-mirai-text-secondary">
                {question.overview}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {question.topics.map((topic) => (
                  <Badge key={topic.id} variant="secondary" className="text-xs">
                    {topic.tag}：{topic.title}
                  </Badge>
                ))}
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
              一問一答を見る
              <ArrowRight aria-hidden="true" className="size-4" />
            </span>
          </Button>
        ))}
      </section>
    </div>
  );
}
