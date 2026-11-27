"use client";

import { MessageCircle, User } from "lucide-react";
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
  const [selectedId, setSelectedId] = useState<string>(questions[0]?.id ?? "");
  const [viewMode, setViewMode] = useState<"summary" | "raw">("summary");

  const tags = collectOitaQuestionTags(questions);
  const filteredQuestions = filterOitaQuestionsByTag(questions, selectedTag);
  const activeQuestion =
    filteredQuestions.find((q) => q.id === selectedId) ??
    filteredQuestions[0] ??
    null;

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

      <div className="grid gap-6 lg:grid-cols-12">
        <section aria-label="質問者一覧" className="space-y-3 lg:col-span-5">
          {filteredQuestions.map((question) => {
            const isSelected = activeQuestion?.id === question.id;
            return (
              <div
                key={question.id}
                className={`rounded-lg border p-4 transition-colors ${
                  isSelected
                    ? "border-primary bg-oita-pink-light"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage
                        src={question.avatarUrl ?? undefined}
                        alt=""
                      />
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
                  <Button
                    type="button"
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => setSelectedId(question.id)}
                  >
                    {isSelected ? "表示中" : "やりとりを見る"}
                  </Button>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-mirai-text-secondary">
                  {question.overview}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {question.topics.map((topic) => (
                    <Badge
                      key={topic.id}
                      variant="secondary"
                      className="text-xs"
                    >
                      {topic.tag}：{topic.title}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <section
          aria-label="一問一答詳細"
          className="rounded-xl border border-border bg-card p-5 lg:col-span-7"
        >
          {activeQuestion ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
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
                      {activeQuestion.sessionLabel}
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-mirai-text">
                      {activeQuestion.questionerName}（{activeQuestion.faction}
                      ）
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

              <div className="space-y-8">
                {activeQuestion.topics.map((topic) => (
                  <div key={topic.id} className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{topic.tag}</Badge>
                      <h3 className="font-bold text-mirai-text">
                        {topic.title}
                      </h3>
                    </div>
                    <div className="space-y-4 rounded-lg bg-mirai-surface p-4">
                      {topic.exchanges.map((turn) => (
                        <ExchangeBubble
                          key={turn.id}
                          turn={turn}
                          mode={viewMode}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-mirai-text-secondary">
              該当する一般質問がありません。
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
